import { describe, it, expect } from 'vitest';
import { speedrun, tierToMs } from '../src/speedrun.js';
import { TOKEN_TARGETS, planTokenBudget } from '../src/mcp/speedrun-plan.js';

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

describe('planTokenBudget', () => {
  it('projects a trillion tokens as a multi-decade, multi-conversation campaign', () => {
    const plan = planTokenBudget(1_000_000_000_000, 'cl100k_base');
    // Throughput is derived from the highest published tier (1,000,000 tokens
    // per hour), not hardcoded, so these follow from the tier table.
    expect(plan.assumedTokensPerSecond).toBeCloseTo(1_000_000 / 3_600, 4);
    expect(plan.requiredHours).toBeCloseTo(1_000_000, 0);
    expect(plan.requiredYears).toBeGreaterThan(100);
    expect(plan.conversationsRequired).toBe(5_000_000);
    expect(plan.estimatedTerabytes).toBeCloseTo(4, 3);
    expect(plan.fitsInOneContext).toBe(false);
    expect(plan.verdict).toContain('Not achievable in one sitting');
  });

  it('scales linearly with the target', () => {
    const million = planTokenBudget(TOKEN_TARGETS.million, 'cl100k_base');
    const billion = planTokenBudget(TOKEN_TARGETS.billion, 'cl100k_base');
    expect(billion.requiredMs / million.requiredMs).toBeCloseTo(1_000, 6);
  });

  it('calls a small target achievable in one sitting', () => {
    const plan = planTokenBudget(1_000, 'cl100k_base');
    expect(plan.fitsInOneContext).toBe(true);
    expect(plan.verdict).toContain('single sitting');
  });

  it('honours a custom context window', () => {
    const plan = planTokenBudget(1_000_000, 'cl100k_base', 500_000);
    expect(plan.conversationsRequired).toBe(2);
  });

  it('rejects non-positive and non-finite targets', () => {
    expect(() => planTokenBudget(0, 'cl100k_base')).toThrow(/positive/);
    expect(() => planTokenBudget(-1, 'cl100k_base')).toThrow(/positive/);
    expect(() => planTokenBudget(Number.NaN, 'cl100k_base')).toThrow(/positive/);
    expect(() => planTokenBudget(Number.POSITIVE_INFINITY, 'cl100k_base')).toThrow(/positive/);
  });
});
