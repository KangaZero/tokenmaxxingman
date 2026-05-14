import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translate } from './transforms/translate.js';
import type { LangCode } from './transforms/translate.js';
import { padding } from './tricks/padding.js';
import { footnotes } from './tricks/footnotes.js';
import { parentheticals } from './tricks/parentheticals.js';
import { citation } from './tricks/citation.js';
import { repetition } from './tricks/repetition.js';

export type { LangCode };

export interface MaxxerOptions {
  targetLanguage?: LangCode;
  paddingMultiplier?: number;
  passes?: number;
  workers?: number;
}

const MAX_PASSES = 5;
const MAX_WORKERS = 8;
const MEMORY_BUDGET_BYTES = 1_048_576; // 1 MB hard cap per pass

function runPipeline(input: string, opts: Required<MaxxerOptions>): string {
  let result = input;

  result = synonyms(result);
  result = qualifiers(result);
  result = nominalizations(result);
  result = padding(result, { targetMultiplier: opts.paddingMultiplier });
  result = footnotes(result);
  result = parentheticals(result);
  result = citation(result);
  result = repetition(result);
  result = passive(result);

  if (opts.targetLanguage !== '') {
    result = translate(result, opts.targetLanguage);
  }

  return result;
}

function resolveOptions(opts?: MaxxerOptions): Required<MaxxerOptions> {
  return {
    targetLanguage: opts?.targetLanguage ?? '',
    paddingMultiplier: opts?.paddingMultiplier ?? 3,
    passes: Math.min(opts?.passes ?? 1, MAX_PASSES),
    workers: Math.min(opts?.workers ?? 1, MAX_WORKERS),
  };
}

export function maxxer(input: string, opts?: MaxxerOptions): string {
  const resolved = resolveOptions(opts);
  let result = input;

  for (let pass = 0; pass < resolved.passes; pass++) {
    if (result.length > MEMORY_BUDGET_BYTES) break;
    result = runPipeline(result, resolved);
  }

  return result;
}

function splitIntoChunks(input: string, chunkCount: number): string[] {
  // Split on sentence boundaries, then group into chunkCount buckets.
  const sentences = input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return [input];

  const perChunk = Math.max(1, Math.ceil(sentences.length / chunkCount));
  const chunks: string[] = [];

  for (let i = 0; i < sentences.length; i += perChunk) {
    chunks.push(sentences.slice(i, i + perChunk).join(' '));
  }

  return chunks;
}

export async function maxxerParallel(input: string, opts?: MaxxerOptions): Promise<string> {
  const resolved = resolveOptions(opts);
  // More workers = smaller chunk size = more chunks.
  const chunkCount = Math.max(1, resolved.workers);
  const chunks = splitIntoChunks(input, chunkCount);

  // Promise.all here is structurally parallel-ready; all work is CPU-bound/sync in this runtime.
  // A future worker_threads upgrade can replace the inner maxxer call with a worker message.
  const processed = await Promise.all(
    chunks.map((chunk) => Promise.resolve(maxxer(chunk, opts))),
  );

  return processed.join(' ');
}
