import type { EncodingName } from '../tokenizer.js';
import type { TimeTier } from '../speedrun.js';
import { tierToMs } from '../speedrun.js';
import { measure } from './measure.js';

/**
 * Published token targets per tier, taken from the `tokensprint` skill contract.
 * These are the numbers the skill promises, so the planner must return exactly
 * them rather than re-deriving a rate and drifting from the documentation.
 */
const TIER_TARGETS: Readonly<Record<TimeTier, number>> = {
  'sprint-1m': 5_000,
  'sprint-5m': 50_000,
  'sprint-10m': 150_000,
  'sprint-1h': 1_000_000,
};

const TIER_ORDER: readonly TimeTier[] = ['sprint-1m', 'sprint-5m', 'sprint-10m', 'sprint-1h'];

/** (durationMs, targetTokens) anchors, ascending by duration. */
const ANCHORS: readonly [number, number][] = TIER_ORDER.map((tier) => [
  tierToMs(tier),
  TIER_TARGETS[tier],
]);

/**
 * Token target for an arbitrary duration.
 *
 * WHY piecewise-linear rather than a single rate: the published tier targets are
 * super-linear (a 60x longer sprint promises 200x the tokens, because throughput
 * climbs as context fills). Interpolating between the published anchors keeps
 * every tier boundary exactly on its documented number; extrapolating outside
 * the range reuses the nearest segment's slope.
 */
export function targetTokensForDuration(durationMs: number): number {
  const first = ANCHORS[0];
  const last = ANCHORS[ANCHORS.length - 1];
  if (first === undefined || last === undefined) {
    return 0;
  }
  if (durationMs <= first[0]) {
    // Below the smallest anchor, reuse the FIRST segment's slope, as documented.
    // (Scaling from the origin instead would silently use a different rate:
    // 0.0833 tok/ms rather than the segment's 0.1875.)
    const second = ANCHORS[1];
    const slope =
      second === undefined ? first[1] / first[0] : (second[1] - first[1]) / (second[0] - first[0]);
    const intercept = first[1] - slope * first[0];
    return Math.max(1, Math.round(slope * durationMs + intercept));
  }
  for (let i = 1; i < ANCHORS.length; i += 1) {
    const lower = ANCHORS[i - 1];
    const upper = ANCHORS[i];
    if (lower === undefined || upper === undefined) {
      continue;
    }
    if (durationMs <= upper[0]) {
      const span = upper[0] - lower[0];
      const progress = span === 0 ? 0 : (durationMs - lower[0]) / span;
      return Math.round(lower[1] + progress * (upper[1] - lower[1]));
    }
  }
  // Above the largest anchor, reuse the LAST segment's slope, as documented.
  const penultimate = ANCHORS[ANCHORS.length - 2];
  const slope =
    penultimate === undefined
      ? last[1] / last[0]
      : (last[1] - penultimate[1]) / (last[0] - penultimate[0]);
  return Math.round(last[1] + slope * (durationMs - last[0]));
}

export interface SpeedrunCheckpoint {
  fraction: number;
  atMs: number;
  cumulativeTokens: number;
}

export interface SpeedrunPlan {
  budgetMs: number;
  tier: TimeTier | null;
  encoding: EncodingName;
  targetTokens: number;
  tokensPerSecondRequired: number;
  checkpoints: SpeedrunCheckpoint[];
  seedTokens: number | null;
  estimatedIterations: number | null;
}

const CHECKPOINT_FRACTIONS: readonly number[] = [0.25, 0.5, 0.75, 1];

/**
 * Compute a sprint budget without burning the budget.
 *
 * The library `speedrun()` blocks for its full duration by design. An MCP tool
 * cannot: a `sprint-1h` call would hold the stdio connection for an hour. This
 * planner is pure arithmetic and returns immediately.
 */
export function planSpeedrun(args: {
  durationMs: number;
  tier: TimeTier | null;
  encoding: EncodingName;
  seed?: string;
}): SpeedrunPlan {
  const targetTokens =
    args.tier === null ? targetTokensForDuration(args.durationMs) : TIER_TARGETS[args.tier];
  const seedTokens = args.seed === undefined ? null : measure(args.seed, args.encoding).tokens;

  return {
    budgetMs: args.durationMs,
    tier: args.tier,
    encoding: args.encoding,
    targetTokens,
    tokensPerSecondRequired: targetTokens / (args.durationMs / 1_000),
    checkpoints: CHECKPOINT_FRACTIONS.map((fraction) => ({
      fraction,
      atMs: Math.round(args.durationMs * fraction),
      cumulativeTokens: Math.round(targetTokens * fraction),
    })),
    seedTokens,
    estimatedIterations:
      seedTokens === null || seedTokens === 0 ? null : Math.ceil(targetTokens / seedTokens),
  };
}
