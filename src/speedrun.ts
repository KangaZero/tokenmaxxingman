// Timing is intentionally non-deterministic — performance.now() is the only escape from the project's determinism rule.
import type { ExpandMode } from './expand.js';
import type { EncodingName } from './tokenizer.js';
import { expand } from './expand.js';
import { countTokens } from './tokenizer.js';

export type TimeTier = 'sprint-1m' | 'sprint-5m' | 'sprint-10m' | 'sprint-1h';

export interface SpeedrunOptions {
  durationMs: number;
  seed: string;
  mode: ExpandMode;
  encoding: EncodingName;
  maxIterations?: number;
}

export interface SpeedrunResult {
  durationMs: number;
  budgetMs: number;
  iterations: number;
  totalTokens: number;
  totalCharacters: number;
  tokensPerSecond: number;
  charactersPerSecond: number;
  finalOutput: string;
  hitMaxIterations: boolean;
  encoding: EncodingName;
  mode: ExpandMode;
}

const TIER_MS: Readonly<Record<TimeTier, number>> = {
  'sprint-1m': 60_000,
  'sprint-5m': 300_000,
  'sprint-10m': 600_000,
  'sprint-1h': 3_600_000,
};

const OUTPUT_CAP = 4096;

export function tierToMs(tier: TimeTier): number {
  return TIER_MS[tier];
}

export function speedrun(opts: SpeedrunOptions): SpeedrunResult {
  const { durationMs, seed, mode, encoding, maxIterations = 10_000 } = opts;

  let iterations = 0;
  let totalTokens = 0;
  let totalCharacters = 0;
  let currentInput = seed;
  let lastOutput = seed;

  const start = performance.now();

  while (true) {
    const elapsed = performance.now() - start;
    if (elapsed >= durationMs || iterations >= maxIterations) break;

    const output = expand(currentInput, mode);
    const count = countTokens(output, encoding);

    totalTokens += count.tokens;
    totalCharacters += count.characters;
    lastOutput = output;
    iterations += 1;

    // Feed the expanded output forward, capped to keep subsequent expand calls bounded.
    currentInput = output.length > OUTPUT_CAP ? output.slice(0, OUTPUT_CAP) : output;
  }

  const actualMs = performance.now() - start;
  const seconds = actualMs / 1000;

  return {
    durationMs: actualMs,
    budgetMs: durationMs,
    iterations,
    totalTokens,
    totalCharacters,
    tokensPerSecond: seconds > 0 ? totalTokens / seconds : 0,
    charactersPerSecond: seconds > 0 ? totalCharacters / seconds : 0,
    // Truncated to at most 4 KB so the result object stays transport-friendly; full output is not retained.
    finalOutput: lastOutput.length > OUTPUT_CAP ? lastOutput.slice(0, OUTPUT_CAP) : lastOutput,
    hitMaxIterations: iterations >= maxIterations,
    encoding,
    mode,
  };
}
