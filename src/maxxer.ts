import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translate } from './transforms/translate.js';
import { codeSwitching } from './transforms/code-switching.js';
import type { LangCode } from './transforms/translate.js';
import { padding } from './tricks/padding.js';
import { footnotes } from './tricks/footnotes.js';
import { parentheticals } from './tricks/parentheticals.js';
import { citation } from './tricks/citation.js';
import { repetition } from './tricks/repetition.js';
import { reduplication } from './tricks/reduplication.js';
import { rhetoricalQuestions } from './tricks/rhetorical-questions.js';
import { splitOnSentenceBoundaries } from './utils/text.js';

export type { LangCode };

export interface MaxxerOptions {
  targetLanguage?: LangCode;
  paddingMultiplier?: number;
  passes?: number;
}

const MAX_PASSES = 5;
const CHUNK_COUNT = 4;
const MEMORY_BUDGET_BYTES = 1_048_576; // 1 MB — stop growing output once a pass crosses this

function runPipeline(input: string, opts: ResolvedOptions): string {
  let result = input;

  // Order matters. Word-level swaps come first so subsequent sentence-level
  // transforms operate on the inflated vocabulary, not the bare originals.
  // Reduplication runs before passive because passive's SVO regex only
  // matches single-token verbs — doubled forms (`good-good`) would otherwise
  // get skipped. Rhetorical questions land near the end so they aren't
  // shredded by upstream sentence-splitting.
  result = synonyms(result);
  result = codeSwitching(result);
  result = qualifiers(result);
  result = nominalizations(result);
  result = reduplication(result);
  result = padding(result, { targetMultiplier: opts.paddingMultiplier });
  result = footnotes(result);
  result = parentheticals(result);
  result = citation(result);
  result = repetition(result);
  result = rhetoricalQuestions(result);
  result = passive(result);

  if (opts.targetLanguage !== '') {
    result = translate(result, opts.targetLanguage);
  }

  return result;
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

function splitIntoChunks(input: string, chunkCount: number): string[] {
  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return [input];

  const perChunk = Math.max(1, Math.ceil(sentences.length / chunkCount));
  const chunks: string[] = [];

  for (let i = 0; i < sentences.length; i += perChunk) {
    chunks.push(sentences.slice(i, i + perChunk).join(' '));
  }

  return chunks;
}

export async function maxxerParallel(input: string, opts?: MaxxerOptions): Promise<string> {
  const chunks = splitIntoChunks(input, CHUNK_COUNT);

  // Promise.all here is structurally parallel-ready; all work is CPU-bound/sync in this runtime.
  // A future worker_threads upgrade can replace the inner maxxer call with a worker message.
  const processed = await Promise.all(chunks.map((chunk) => Promise.resolve(maxxer(chunk, opts))));

  return processed.join(' ');
}
