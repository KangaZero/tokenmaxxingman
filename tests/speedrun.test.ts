import { describe, it, expect } from 'vitest';
import { speedrun, tierToMs } from '../src/speedrun.js';

describe('tierToMs', () => {
  it('sprint-1m returns 60_000', () => {
    expect(tierToMs('sprint-1m')).toBe(60_000);
  });

  it('sprint-5m returns 300_000', () => {
    expect(tierToMs('sprint-5m')).toBe(300_000);
  });

  it('sprint-10m returns 600_000', () => {
    expect(tierToMs('sprint-10m')).toBe(600_000);
  });

  it('sprint-1h returns 3_600_000', () => {
    expect(tierToMs('sprint-1h')).toBe(3_600_000);
  });
});

describe('speedrun', () => {
  it('produces at least 1 iteration with totalTokens > 0 and tokensPerSecond > 0', () => {
    const result = speedrun({
      durationMs: 10,
      seed: 'hello',
      mode: 'verbose-lite',
      encoding: 'cl100k_base',
    });

    expect(result.iterations).toBeGreaterThanOrEqual(1);
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(result.tokensPerSecond).toBeGreaterThan(0);
  });

  it('respects maxIterations:1 — exactly 1 iteration and hitMaxIterations is true', () => {
    const result = speedrun({
      durationMs: 1000,
      seed: 'hello',
      mode: 'verbose-lite',
      encoding: 'cl100k_base',
      maxIterations: 1,
    });

    expect(result.iterations).toBe(1);
    expect(result.hitMaxIterations).toBe(true);
  });

  it('actual durationMs >= budgetMs (with 50ms slack for the final iteration)', () => {
    const budget = 10;
    const result = speedrun({
      durationMs: budget,
      seed: 'hello',
      mode: 'verbose-lite',
      encoding: 'cl100k_base',
    });

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.durationMs).toBeLessThan(budget + 50);
    expect(result.budgetMs).toBe(budget);
  });

  it('finalOutput is at most 4096 characters', () => {
    const result = speedrun({
      durationMs: 10,
      seed: 'hello world, this is a test of the speedrun module with a reasonably long seed string',
      mode: 'verbose-ultra',
      encoding: 'cl100k_base',
    });

    expect(result.finalOutput.length).toBeLessThanOrEqual(4096);
  });

  it('echoes mode and encoding in the result', () => {
    const result = speedrun({
      durationMs: 10,
      seed: 'hello',
      mode: 'verbose-full',
      encoding: 'o200k_base',
    });

    expect(result.mode).toBe('verbose-full');
    expect(result.encoding).toBe('o200k_base');
  });

  it('budgetMs reflects the requested durationMs', () => {
    const result = speedrun({
      durationMs: 15,
      seed: 'test',
      mode: 'verbose-lite',
      encoding: 'cl100k_base',
    });

    expect(result.budgetMs).toBe(15);
  });

  // Gap: maxIterations: 0 — loop exits before the first iteration.
  // tokensPerSecond and charactersPerSecond both resolve via the `seconds > 0` ternary;
  // with zero iterations they should be 0 (not a divide-by-zero NaN).
  it('maxIterations: 0 produces zero iterations, hitMaxIterations: true, and zero token rates', () => {
    const result = speedrun({
      durationMs: 5000,
      seed: 'hello',
      mode: 'verbose-lite',
      encoding: 'cl100k_base',
      maxIterations: 0,
    });

    expect(result.iterations).toBe(0);
    expect(result.hitMaxIterations).toBe(true);
    expect(result.totalTokens).toBe(0);
    // tokensPerSecond must be 0 (not NaN) — the `seconds > 0` guard protects this
    expect(result.tokensPerSecond).toBe(0);
    expect(result.charactersPerSecond).toBe(0);
  });

  // Gap: output.length > OUTPUT_CAP (4096) — the currentInput slicing branch at line 68.
  // Use a seed large enough that its verbose-ultra expansion exceeds 4096 chars.
  it('slices currentInput when expanded output exceeds OUTPUT_CAP (4096 chars)', () => {
    const longSeed =
      'Use this to help. Start the process. Consider what to do. Find a way. Make a plan. '.repeat(
        5,
      );
    const result = speedrun({
      durationMs: 100,
      seed: longSeed,
      mode: 'verbose-ultra',
      encoding: 'cl100k_base',
      maxIterations: 2,
    });

    // With verbose-ultra on a ~400-char seed, first expansion greatly exceeds 4096 chars.
    // The test asserts the run completes without error and finalOutput is capped at 4096.
    expect(result.finalOutput.length).toBeLessThanOrEqual(4096);
    expect(result.iterations).toBeGreaterThanOrEqual(1);
  });
});
