// Timing is intentionally non-deterministic — performance.now() is the only escape from the project's determinism rule.
import type { ExpandMode } from './expand.js';
import type { EncodingName } from './tokenizer.js';
import { expand } from './expand.js';
import { countTokens } from './tokenizer.js';

export type TimeTier = 'sprint-1m' | 'sprint-5m' | 'sprint-10m' | 'sprint-1h';

export interface SpeedrunOptions {
  /** Time budget in milliseconds. Must be finite and greater than zero. */
  durationMs: number;
  seed: string;
  mode: ExpandMode;
  encoding: EncodingName;
  /**
   * Safety cap on iterations. Must be a non-negative safe integer; `0` is a valid
   * request for "do no work" and returns a zero-iteration result.
   */
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

/**
 * Generate as many tokens as possible within a time budget.
 *
 * @throws {RangeError} if `durationMs` is not a finite number greater than zero,
 * or if `maxIterations` is not a non-negative safe integer.
 *
 * WHY it throws rather than clamping: both are programming errors, not user input.
 * The loop condition is `elapsed >= durationMs`, and `elapsed >= NaN` is *always*
 * false, so a `NaN` budget silently ran the full 10,000-iteration cap and then
 * reported `budgetMs: NaN`, which `JSON.stringify` renders as `null` — a value
 * that is not a valid duration and cannot be distinguished downstream from a
 * missing field. `speedrun` is exported from the package root, so the library API
 * needs its own guard: the CLI's `parseDuration` protects only the CLI path.
 * Clamping would hide the caller's bug behind a plausible-looking result.
 */
export function speedrun(opts: SpeedrunOptions): SpeedrunResult {
  const { durationMs, seed, mode, encoding, maxIterations = 10_000 } = opts;

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError(
      `speedrun: durationMs must be a finite number greater than 0, received ${String(durationMs)}`,
    );
  }
  if (!Number.isSafeInteger(maxIterations) || maxIterations < 0) {
    throw new RangeError(
      `speedrun: maxIterations must be a non-negative safe integer, received ${String(maxIterations)}`,
    );
  }

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
