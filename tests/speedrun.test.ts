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
});
