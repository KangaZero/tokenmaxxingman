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

/**
 * Named token targets, for callers who want to ask "how long would N take?"
 * without writing the zeroes out and miscounting them.
 */
export const TOKEN_TARGETS = {
  million: 1_000_000,
  billion: 1_000_000_000,
  trillion: 1_000_000_000_000,
} as const;

export type TokenTargetName = keyof typeof TOKEN_TARGETS;

export interface TokenBudgetPlan {
  targetTokens: number;
  encoding: EncodingName;
  /** Sustained tokens/second taken from the highest published tier. */
  assumedTokensPerSecond: number;
  requiredMs: number;
  requiredHours: number;
  requiredYears: number;
  /** Whole conversations needed at `contextWindowTokens` each. */
  conversationsRequired: number;
  contextWindowTokens: number;
  /** Approximate UTF-8 size of the generated text. */
  estimatedBytes: number;
  estimatedTerabytes: number;
  /** False whenever the target cannot fit in one context window. */
  fitsInOneContext: boolean;
  /** Plain-language verdict. Deliberately not optimistic. */
  verdict: string;
}

/** A generous modern context window, used only to count conversations. */
const DEFAULT_CONTEXT_WINDOW_TOKENS = 200_000;

/** Mean UTF-8 bytes per token for the amplified English this project produces. */
const BYTES_PER_TOKEN = 4;

const MS_PER_HOUR = 3_600_000;
const MS_PER_YEAR = 365 * 24 * MS_PER_HOUR;

/**
 * Invert {@link planSpeedrun}: given a token target, report what it would cost
 * in time, conversations, and bytes.
 *
 * WHY this exists rather than a `sprint-1t` time tier: a trillion tokens is not
 * a duration, it is a quantity, and the honest answer to "can we consume a
 * trillion tokens?" is a projection rather than an attempt. The throughput is
 * derived from the project's own highest published tier instead of being
 * invented, so if those figures are ever revised this follows automatically.
 *
 * No monetary estimate is returned. Provider pricing changes far faster than
 * this file would be updated, and a stale dollar figure presented with this much
 * apparent precision would be worse than no figure at all.
 */
export function planTokenBudget(
  targetTokens: number,
  encoding: EncodingName,
  contextWindowTokens: number = DEFAULT_CONTEXT_WINDOW_TOKENS,
): TokenBudgetPlan {
  if (!Number.isFinite(targetTokens) || targetTokens <= 0) {
    throw new Error('targetTokens must be a positive, finite number');
  }
  if (!Number.isFinite(contextWindowTokens) || contextWindowTokens <= 0) {
    throw new Error('contextWindowTokens must be a positive, finite number');
  }

  const topTier = ANCHORS[ANCHORS.length - 1];
  const assumedTokensPerSecond =
    topTier === undefined ? 1 : topTier[1] / (topTier[0] / 1_000);

  const requiredMs = (targetTokens / assumedTokensPerSecond) * 1_000;
  const requiredYears = requiredMs / MS_PER_YEAR;
  const estimatedBytes = targetTokens * BYTES_PER_TOKEN;
  const conversationsRequired = Math.ceil(targetTokens / contextWindowTokens);

  const verdict =
    requiredYears >= 1
      ? `Not achievable in one sitting. At ${assumedTokensPerSecond.toFixed(1)} tokens/sec this needs ${requiredYears.toFixed(1)} years of continuous generation and ${conversationsRequired.toLocaleString('en-US')} separate conversations. Treat it as a lifetime target, not a session.`
      : requiredMs >= MS_PER_HOUR
        ? `Achievable only as a campaign: ${(requiredMs / MS_PER_HOUR).toFixed(1)} hours across ${conversationsRequired.toLocaleString('en-US')} conversation(s).`
        : `Achievable in a single sitting: ${(requiredMs / 1_000).toFixed(1)} seconds across ${conversationsRequired.toLocaleString('en-US')} conversation(s).`;

  return {
    targetTokens,
    encoding,
    assumedTokensPerSecond,
    requiredMs,
    requiredHours: requiredMs / MS_PER_HOUR,
    requiredYears,
    conversationsRequired,
    contextWindowTokens,
    estimatedBytes,
    estimatedTerabytes: estimatedBytes / 1_000_000_000_000,
    fitsInOneContext: targetTokens <= contextWindowTokens,
    verdict,
  };
}
