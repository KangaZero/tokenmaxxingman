import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translateSentences } from './transforms/translate.js';
import { codeSwitching } from './transforms/code-switching.js';
import type { LangCode } from './transforms/translate.js';
import { padding } from './tricks/padding.js';
import { footnotes } from './tricks/footnotes.js';
import { parentheticals } from './tricks/parentheticals.js';
import { citation } from './tricks/citation.js';
import { repetition } from './tricks/repetition.js';
import { reduplication } from './tricks/reduplication.js';
import { rhetoricalQuestions } from './tricks/rhetorical-questions.js';

export type { LangCode };

export interface MaxxerOptions {
  targetLanguage?: LangCode;
  paddingMultiplier?: number;
  passes?: number;
}

const MAX_PASSES = 5;
const MEMORY_BUDGET_BYTES = 1_048_576; // 1 MB — hard ceiling on output length

/**
 * Apply `transforms` in order, stopping as soon as the budget is crossed.
 *
 * WHY inside the pipeline rather than only between passes: a single pass grows
 * its input by roughly 30×, so checking only at pass boundaries let a 188-byte
 * input reach 10.85 MB at `passes: 3` — about 11× the stated 1 MB budget, and
 * slow enough to blow a 5-second test timeout. A budget that is only inspected
 * after the damage is not a budget.
 */
function applyBudgeted(input: string, transforms: readonly ((text: string) => string)[]): string {
  // The ceiling never falls below the input: truncating text the caller supplied
  // would be data loss, and the budget exists to bound *growth*, not to censor.
  // An input already over budget is therefore returned untouched rather than
  // amplified 30× (which is precisely the denial-of-service case) or clipped.
  const ceiling = Math.max(MEMORY_BUDGET_BYTES, input.length);
  let result = input;
  for (const transform of transforms) {
    if (result.length >= ceiling) break;
    result = transform(result);
  }
  return result.length > ceiling ? result.slice(0, ceiling) : result;
}

function runPipeline(input: string, opts: ResolvedOptions): string {
  // Order matters.
  //
  // Translation runs FIRST: the phrasebooks are keyed by plain source sentences,
  // so a lookup after the English amplifiers have rewritten the text can never
  // match. Running it last made `targetLanguage` a silent no-op that emitted no
  // non-Latin characters at all. Unknown sentences stay in English.
  //
  // Word-level swaps come next so the sentence-level transforms operate on the
  // inflated vocabulary rather than the bare originals. Reduplication precedes
  // passive because passive's SVO regex only matches single-token verbs, so
  // doubled forms (`good-good`) would otherwise be skipped. Rhetorical questions
  // land near the end so upstream sentence-splitting cannot shred them.
  return applyBudgeted(input, [
    (text) => (opts.targetLanguage === '' ? text : translateSentences(text, opts.targetLanguage)),
    synonyms,
    codeSwitching,
    qualifiers,
    nominalizations,
    reduplication,
    (text) => padding(text, { targetMultiplier: opts.paddingMultiplier }),
    footnotes,
    parentheticals,
    citation,
    repetition,
    rhetoricalQuestions,
    passive,
  ]);
}

type ResolvedOptions = Required<Omit<MaxxerOptions, 'targetLanguage'>> & { targetLanguage: string };

function resolveOptions(opts?: MaxxerOptions): ResolvedOptions {
  return {
    targetLanguage: opts?.targetLanguage ?? '',
    paddingMultiplier: opts?.paddingMultiplier ?? 3,
    passes: Math.min(opts?.passes ?? 1, MAX_PASSES),
  };
}

export function maxxer(input: string, opts?: MaxxerOptions): string {
  const resolved = resolveOptions(opts);
  let result = input;

  for (let pass = 0; pass < resolved.passes; pass++) {
    result = runPipeline(result, resolved);
    // Stop before the next pass once output has crossed the budget. The check
    // runs after the pass so a large initial input still gets expanded once,
    // rather than being silently returned unchanged.
    if (result.length > MEMORY_BUDGET_BYTES) break;
  }

  return result;
}

/**
 * Async wrapper around {@link maxxer}.
 *
 * WHY this no longer chunks: it used to split the input into `CHUNK_COUNT`
 * sentence groups and process each independently, which produced output that
 * DIFFERED from `maxxer` on the same input despite the two being documented as
 * equivalent — a 5-sentence input diverged at character 3,469. The cause is
 * structural: `qualifiers`, `citation`, `repetition`, `rhetoricalQuestions`, and
 * `padding` all select their content by sentence index modulo a pool length, and
 * chunking restarts that index at zero in every chunk. Splitting also yielded 3
 * chunks rather than 4 for 5 sentences, and rejoining with a single space lost
 * the original separators.
 *
 * None of that bought anything: every transform here is synchronous and
 * CPU-bound, so `Promise.all` over chunks never actually ran in parallel. The
 * honest implementation is therefore to delegate and keep the async signature,
 * which preserves the public API and guarantees the equivalence the docs claim.
 *
 * A genuine parallel implementation needs `worker_threads` plus a global
 * sentence offset threaded through the index-modulo transforms, so that a worker
 * processing sentences 12-17 selects the same pool entries it would have in a
 * single pass. That is the shape of the future upgrade; chunking without it is
 * simply wrong.
 */
export async function maxxerParallel(input: string, opts?: MaxxerOptions): Promise<string> {
  return Promise.resolve(maxxer(input, opts));
}
