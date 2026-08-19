import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { completable } from '@modelcontextprotocol/sdk/server/completable.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { EXPAND_MODES, DEPRECATED_EXPAND_MODES, expand } from '../expand.js';
import type { ExpandMode } from '../expand.js';
import { maxxer } from '../maxxer.js';
import { runBenchmark } from '../benchmark.js';
import { loadCorpus } from '../corpus.js';
import { toMarkdown } from '../formatters/markdown.js';
import { tierToMs } from '../speedrun.js';
import type { TimeTier } from '../speedrun.js';
import type { EncodingName } from '../tokenizer.js';
import { targets as LANG_CODES } from '../transforms/translate.js';
import { readManifest } from '../paths.js';

import { inflation, measure } from './measure.js';
import { TOKEN_TARGETS, planSpeedrun, planTokenBudget } from './speedrun-plan.js';
import { SERVER_INSTRUCTIONS } from './instructions.js';
import {
  ENCODING_NAMES,
  MAX_OUTPUT_CHARS,
  TIME_TIERS,
  encodingInput,
  inflationShape,
  langCodeInput,
  localeInput,
  measurementShape,
  modeInput,
  textInput,
} from './schemas.js';
import {
  SKILL_SECTIONS,
  discoverSkills,
  readSkillSection,
  skillSectionFileName,
} from './skills.js';
import type { SkillDescriptor, SkillSection } from './skills.js';

/**
 * Reverse-DNS `_meta` namespace, per the MCP convention for vendor extensions.
 *
 * Uses the `io.github.<owner>.<repo>` form rather than `dev.tokenmaxxingman`:
 * reverse-DNS notation asserts control of the domain it names, and the project
 * owns the GitHub path, not `tokenmaxxingman.dev`. The spec reserves only
 * namespaces whose second label is `mcp` or `modelcontextprotocol`.
 */
const META_NS = 'io.github.kangazero.tokenmaxxingman';

const ICON_SRC =
  'https://raw.githubusercontent.com/KangaZero/tokenmaxxingman/main/web/public/favicon.svg';

/**
 * Vendor metadata attached to every tool.
 *
 * `determinism` and `offline` let a client cache or replay results confidently;
 * `costHint` lets it decide whether a call is worth an extra round trip.
 */
function toolMeta(extra: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return {
    [`${META_NS}/determinism`]: 'deterministic',
    [`${META_NS}/offline`]: true,
    ...extra,
  };
}

/**
 * Annotations shared by every tool here: all seven are pure reads/computations
 * over bundled data. Spelling it once keeps a future non-read-only tool from
 * inheriting the wrong hints by copy-paste.
 *
 * `destructiveHint` and `idempotentHint` are deliberately omitted. The
 * 2025-11-25 schema documents both as "meaningful only when
 * `readOnlyHint == false`", so declaring them alongside `readOnlyHint: true`
 * conveys nothing and invites a reader to think it does.
 *
 * `annotations.title` is likewise omitted: each tool already sets the top-level
 * `title`, which takes precedence per `BaseMetadata`. Setting both meant one
 * tool rendered under two different labels depending on client vintage.
 */
const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  openWorldHint: false,
} as const;

function textResult(text: string, structuredContent: Record<string, unknown>): CallToolResult {
  return { content: [{ type: 'text', text }], structuredContent };
}

/**
 * Turn a thrown error into a protocol-level tool error.
 *
 * Returning `isError` rather than rejecting keeps the failure visible to the
 * model (which can then correct its arguments) instead of surfacing as an
 * opaque transport fault.
 */
function errorResult(err: unknown): CallToolResult {
  return {
    content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
    isError: true,
  };
}

/**
 * Convert a resource-read failure into a caller-attributable protocol error.
 *
 * Two reasons this is not just `throw err`:
 *   1. An unknown URI is the *caller's* mistake, so it must be `InvalidParams`
 *      (-32602), not `InternalError` (-32603), which claims a server fault.
 *   2. The underlying errors interpolate absolute filesystem paths. For a stdio
 *      server that may run sandboxed, that discloses the install location,
 *      username, and directory layout to a remote model. Full detail goes to
 *      stderr for the operator; the client gets a message without a path.
 */
function resourceError(uri: string, err: unknown): McpError {
  const detail = err instanceof Error ? err.message : String(err);
  process.stderr.write(`tokenmaxxingman: resource read failed for ${uri}: ${detail}\n`);
  return new McpError(ErrorCode.InvalidParams, `cannot read resource ${uri}`);
}

function deprecationNotice(mode: ExpandMode): string {
  const canonical = DEPRECATED_EXPAND_MODES[mode];
  return canonical === undefined
    ? ''
    : `\n\nNote: mode "${mode}" is a deprecated alias for "${canonical}" and will be removed in 1.0.`;
}

function formatMeasurement(label: string, m: ReturnType<typeof measure>): string {
  return [
    `${label}: ${m.tokens} tokens, ${m.characters} chars, ${m.words} words`,
    `  ${m.tokensPerCharacter.toFixed(4)} tokens/char, ${m.tokensPerWord.toFixed(4)} tokens/word`,
  ].join('\n');
}

function registerExpandText(server: McpServer): void {
  server.registerTool(
    'expand_text',
    {
      title: 'Expand text (named pipeline)',
      description:
        'Inflate prose through one named, deterministic pipeline and return the result alongside before/after token measurements. Use this instead of writing a verbose rewrite by hand: the transform is reproducible and the inflation ratio is measured, not guessed. Never pass source code, error text, or structured data.',
      inputSchema: {
        text: textInput,
        mode: modeInput,
        encoding: encodingInput,
        locale: localeInput,
      },
      outputSchema: {
        mode: z.enum(EXPAND_MODES),
        canonicalMode: z
          .enum(EXPAND_MODES)
          .describe('The mode actually applied, with deprecated aliases resolved.'),
        encoding: z.enum(ENCODING_NAMES),
        output: z.string().describe('The expanded text.'),
        before: z.object(measurementShape),
        after: z.object(measurementShape),
        inflation: z.object(inflationShape),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'transform',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    ({ text, mode, encoding, locale }) => {
      try {
        const output = expand(text, mode);
        const before = measure(text, encoding, locale);
        const after = measure(output, encoding, locale);
        const ratios = inflation(before, after);
        const canonicalMode = DEPRECATED_EXPAND_MODES[mode] ?? mode;
        const summary = [
          `mode: ${mode}${canonicalMode === mode ? '' : ` → ${canonicalMode}`} | encoding: ${encoding}`,
          formatMeasurement('before', before),
          formatMeasurement('after ', after),
          `inflation: ${ratios.tokenRatio.toFixed(2)}x tokens (+${ratios.tokensAdded}), ${ratios.characterRatio.toFixed(2)}x chars`,
          '',
          output,
        ].join('\n');
        return textResult(summary + deprecationNotice(mode), {
          mode,
          canonicalMode,
          encoding,
          output,
          before,
          after,
          inflation: ratios,
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

/**
 * Reject `maxx_text` settings whose worst case would block the event loop or
 * blow the response budget, BEFORE doing the work.
 *
 * WHY a pre-check and not just a post-hoc truncation: the cost here is CPU, not
 * just bytes. Measured worst case at the old limits — 100,000 characters with
 * `passes: 5` and `paddingMultiplier: 20` — produced 6.2 million characters in
 * 5.5 seconds during which the server answered nothing at all, not even a
 * cancellation. Truncating the result afterwards would not give those seconds
 * back. The server is single-threaded; a blocked loop is a dead server.
 *
 * The estimate is deliberately crude. Each pass multiplies length by roughly
 * the padding multiplier, so growth is `paddingMultiplier ** passes`. Being
 * approximate is fine: this is a guard rail, and the post-hoc cap below is the
 * actual guarantee.
 */
function estimateMaxxerGrowth(inputChars: number, passes: number, paddingMultiplier: number): number {
  return inputChars * Math.pow(paddingMultiplier, passes);
}

function registerMaxxText(server: McpServer): void {
  server.registerTool(
    'maxx_text',
    {
      title: 'Maximise tokens (every trick)',
      description:
        'Apply the full amplification pipeline — synonym swap, code-switching, qualifiers, nominalisation, reduplication, essay padding, footnotes, parentheticals, fabricated-format citations, repetition, rhetorical questions, passive voice, and an optional translation pass. Use when the goal is a measured maximum rather than a particular register. Output grows super-linearly in `passes` and `paddingMultiplier`; the server rejects combinations whose worst-case output would exceed its response budget, so prefer small inputs with high settings over the reverse.',
      inputSchema: {
        text: textInput,
        targetLanguage: langCodeInput.optional(),
        paddingMultiplier: z
          .number()
          .int()
          .min(1)
          .max(20)
          .default(3)
          .describe('Essay-padding multiplier. Higher means more filler prose per sentence.'),
        passes: z
          .number()
          .int()
          .min(1)
          .max(5)
          .default(1)
          .describe('How many times to run the whole pipeline. Cost grows steeply; 1-2 is usual.'),
        encoding: encodingInput,
        locale: localeInput,
      },
      outputSchema: {
        encoding: z.enum(ENCODING_NAMES),
        passes: z.number().int(),
        paddingMultiplier: z.number().int(),
        targetLanguage: z.string().nullable(),
        output: z.string(),
        truncated: z
          .boolean()
          .describe(
            `True when output was cut to the ${MAX_OUTPUT_CHARS}-character response budget. Measurements describe the returned text.`,
          ),
        before: z.object(measurementShape),
        after: z.object(measurementShape),
        inflation: z.object(inflationShape),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'transform',
        [`${META_NS}/costHint`]: 'high',
      }),
    },
    ({ text, targetLanguage, paddingMultiplier, passes, encoding, locale }) => {
      try {
        const inputChars = [...text].length;
        const projected = estimateMaxxerGrowth(inputChars, passes, paddingMultiplier);
        if (projected > MAX_OUTPUT_CHARS) {
          const affordable = Math.max(
            1,
            Math.floor(MAX_OUTPUT_CHARS / Math.pow(paddingMultiplier, passes)),
          );
          throw new Error(
            `these settings would produce roughly ${Math.round(projected).toLocaleString('en-US')} characters, over the ${MAX_OUTPUT_CHARS.toLocaleString('en-US')} budget. ` +
              `Lower \`passes\` or \`paddingMultiplier\`, or pass at most ~${affordable.toLocaleString('en-US')} characters of text at these settings.`,
          );
        }

        const raw = maxxer(text, {
          paddingMultiplier,
          passes,
          ...(targetLanguage !== undefined ? { targetLanguage } : {}),
        });
        // The hard guarantee. The estimate above is approximate, so a pass that
        // overshoots is still capped rather than shipped.
        const truncated = raw.length > MAX_OUTPUT_CHARS;
        const output = truncated ? raw.slice(0, MAX_OUTPUT_CHARS) : raw;
        const before = measure(text, encoding, locale);
        const after = measure(output, encoding, locale);
        const ratios = inflation(before, after);
        const summary = [
          `passes: ${passes} | paddingMultiplier: ${paddingMultiplier} | targetLanguage: ${targetLanguage ?? 'none'} | encoding: ${encoding}${truncated ? ' | TRUNCATED to response budget' : ''}`,
          formatMeasurement('before', before),
          formatMeasurement('after ', after),
          `inflation: ${ratios.tokenRatio.toFixed(2)}x tokens (+${ratios.tokensAdded}), ${ratios.characterRatio.toFixed(2)}x chars`,
          '',
          output,
        ].join('\n');
        return textResult(summary, {
          encoding,
          passes,
          paddingMultiplier,
          targetLanguage: targetLanguage ?? null,
          output,
          truncated,
          before,
          after,
          inflation: ratios,
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerCountTokens(server: McpServer): void {
  server.registerTool(
    'count_tokens',
    {
      title: 'Count tokens',
      description:
        'Measure text against a pinned BPE vocabulary. Returns tokens, characters, UTF-8 bytes, word-like segments, and both density ratios. Call this instead of estimating a token count — an estimate is never citable.',
      inputSchema: { text: textInput, encoding: encodingInput, locale: localeInput },
      outputSchema: { encoding: z.enum(ENCODING_NAMES), ...measurementShape },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'measurement',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    ({ text, encoding, locale }) => {
      try {
        const m = measure(text, encoding, locale);
        return textResult(`encoding: ${encoding}\n${formatMeasurement('measured', m)}`, {
          encoding,
          ...m,
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerBenchmarkLanguages(server: McpServer): void {
  server.registerTool(
    'benchmark_languages',
    {
      title: 'Benchmark languages by token density',
      description:
        'Rank every language and register in the bundled corpus by tokens-per-character under the selected encoding. Rank 1 is the most token-hungry. These are real measurements over a fixed parallel corpus — quote them rather than recalling a figure, and never wrap them in an invented citation.',
      inputSchema: {
        encoding: encodingInput,
        limit: z
          .number()
          .int()
          .min(1)
          .max(64)
          .optional()
          .describe('Return only the top N rows by rank. Omit for the full table.'),
        format: z
          .enum(['markdown', 'json'])
          .default('markdown')
          .describe('Shape of the text content. Structured output is always present regardless.'),
      },
      outputSchema: {
        encoding: z.enum(ENCODING_NAMES),
        corpusVersion: z.string(),
        rowCount: z.number().int(),
        rows: z.array(
          z.object({
            rank: z.number().int(),
            code: z.string(),
            name: z.string(),
            family: z.enum(['natural', 'register']),
            script: z.string(),
            tokensPerCharacter: z.number(),
            tokensPerWord: z.number(),
            tokensPerSentence: z.number(),
            totalTokens: z.number().int(),
          }),
        ),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'measurement',
        [`${META_NS}/costHint`]: 'medium',
      }),
    },
    ({ encoding, limit, format }) => {
      try {
        const result = runBenchmark(loadCorpus(), encoding);
        const rows = limit === undefined ? result.rows : result.rows.slice(0, limit);
        const trimmed = rows.map((row) => ({
          rank: row.rank,
          code: row.code,
          name: row.name,
          family: row.family,
          script: row.script,
          tokensPerCharacter: row.tokensPerCharacter,
          tokensPerWord: row.tokensPerWord,
          tokensPerSentence: row.tokensPerSentence,
          totalTokens: row.totalTokens,
        }));
        const text =
          format === 'json'
            ? JSON.stringify(
                { encoding, corpusVersion: result.corpusVersion, rows: trimmed },
                null,
                2,
              )
            : toMarkdown({ ...result, rows });
        return textResult(text, {
          encoding,
          corpusVersion: result.corpusVersion,
          rowCount: trimmed.length,
          rows: trimmed,
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerPlanSpeedrun(server: McpServer): void {
  server.registerTool(
    'plan_speedrun',
    {
      title: 'Plan a token speedrun',
      description:
        'Return the token target and pacing plan for a time-budgeted sprint. Pure arithmetic: it computes the budget, it does not consume it, so a one-hour tier returns immediately. Supply either `tier` or `durationMs`. Optionally supply `seed` to get a per-iteration token estimate.',
      inputSchema: {
        tier: z
          .enum(TIME_TIERS)
          .optional()
          .describe('Published tier. Mutually exclusive with `durationMs`.'),
        durationMs: z
          .number()
          .int()
          .min(1_000)
          .max(86_400_000)
          .optional()
          .describe('Custom budget in milliseconds, interpolated between the published tiers.'),
        seed: z
          .string()
          .min(1)
          .max(10_000)
          .optional()
          .describe('Starting text, used to estimate tokens per iteration.'),
        encoding: encodingInput,
      },
      outputSchema: {
        tier: z.enum(TIME_TIERS).nullable(),
        encoding: z.enum(ENCODING_NAMES),
        budgetMs: z.number().int(),
        targetTokens: z.number().int(),
        tokensPerSecondRequired: z.number(),
        checkpoints: z.array(
          z.object({
            fraction: z.number(),
            atMs: z.number().int(),
            cumulativeTokens: z.number().int(),
          }),
        ),
        seedTokens: z.number().int().nullable(),
        estimatedIterations: z.number().int().nullable(),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'planning',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    ({ tier, durationMs, seed, encoding }) => {
      try {
        if (tier === undefined && durationMs === undefined) {
          throw new Error('supply either `tier` or `durationMs`');
        }
        if (tier !== undefined && durationMs !== undefined) {
          throw new Error('`tier` and `durationMs` are mutually exclusive');
        }
        const resolvedTier: TimeTier | null = tier ?? null;
        const budgetMs = tier !== undefined ? tierToMs(tier) : (durationMs as number);
        const plan = planSpeedrun({
          durationMs: budgetMs,
          tier: resolvedTier,
          encoding,
          ...(seed !== undefined ? { seed } : {}),
        });
        const lines = [
          `tier: ${plan.tier ?? 'custom'} | budget: ${plan.budgetMs}ms | encoding: ${plan.encoding}`,
          `target: ${plan.targetTokens} tokens (${plan.tokensPerSecondRequired.toFixed(1)} tokens/sec required)`,
          ...plan.checkpoints.map(
            (c) =>
              `  ${(c.fraction * 100).toFixed(0)}% @ ${c.atMs}ms → ${c.cumulativeTokens} tokens`,
          ),
          plan.seedTokens === null
            ? '  seed: not supplied'
            : `  seed: ${plan.seedTokens} tokens → ~${plan.estimatedIterations ?? 0} iterations`,
        ];
        return textResult(lines.join('\n'), { ...plan });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerPlanTokenBudget(server: McpServer): void {
  server.registerTool(
    'plan_token_budget',
    {
      title: 'Project the cost of a token target',
      description:
        'Invert the speedrun planner: given a token target, report how long it would take, how many separate conversations it needs, and roughly how many bytes of text it produces. Answers questions like "can we consume a trillion tokens?" honestly, with arithmetic rather than enthusiasm. Pure computation; it projects the cost and does not incur it.',
      inputSchema: {
        target: z
          .enum(['million', 'billion', 'trillion'])
          .optional()
          .describe('A named target. Mutually exclusive with `targetTokens`.'),
        targetTokens: z
          .number()
          .int()
          .min(1)
          .max(1_000_000_000_000_000)
          .optional()
          .describe('An explicit token target. Mutually exclusive with `target`.'),
        contextWindowTokens: z
          .number()
          .int()
          .min(1_000)
          .max(100_000_000)
          .optional()
          .describe('Context window used to count conversations. Defaults to 200,000.'),
        encoding: encodingInput,
      },
      outputSchema: {
        targetTokens: z.number(),
        encoding: z.enum(ENCODING_NAMES),
        assumedTokensPerSecond: z.number(),
        requiredMs: z.number(),
        requiredHours: z.number(),
        requiredYears: z.number(),
        conversationsRequired: z.number().int(),
        contextWindowTokens: z.number().int(),
        estimatedBytes: z.number(),
        estimatedTerabytes: z.number(),
        fitsInOneContext: z.boolean(),
        verdict: z.string(),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'planning',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    ({ target, targetTokens, contextWindowTokens, encoding }) => {
      try {
        if (target === undefined && targetTokens === undefined) {
          throw new Error('supply either `target` or `targetTokens`');
        }
        if (target !== undefined && targetTokens !== undefined) {
          throw new Error('`target` and `targetTokens` are mutually exclusive');
        }
        const resolved = target !== undefined ? TOKEN_TARGETS[target] : (targetTokens as number);
        const plan = planTokenBudget(resolved, encoding, contextWindowTokens);
        const lines = [
          `target: ${plan.targetTokens.toLocaleString('en-US')} tokens | encoding: ${plan.encoding}`,
          `assumed throughput: ${plan.assumedTokensPerSecond.toFixed(1)} tokens/sec (from the highest published sprint tier)`,
          `time required: ${plan.requiredHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} hours (${plan.requiredYears.toFixed(2)} years)`,
          `conversations: ${plan.conversationsRequired.toLocaleString('en-US')} at ${plan.contextWindowTokens.toLocaleString('en-US')} tokens each`,
          `text volume: ~${plan.estimatedTerabytes.toFixed(3)} TB`,
          `fits in one context: ${plan.fitsInOneContext ? 'yes' : 'no'}`,
          '',
          plan.verdict,
        ];
        return textResult(lines.join('\n'), { ...plan });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerListModes(server: McpServer, skills: readonly SkillDescriptor[]): void {
  server.registerTool(
    'list_modes',
    {
      title: 'List modes, languages, tiers, and skills',
      description:
        'Enumerate every valid enum value this server accepts: expand modes (with deprecated aliases marked), translation language codes, encodings, sprint tiers, and bundled skill names. Call this instead of guessing an argument value.',
      inputSchema: {},
      outputSchema: {
        expandModes: z.array(z.enum(EXPAND_MODES)),
        deprecatedExpandModes: z.record(z.string(), z.string()),
        encodings: z.array(z.enum(ENCODING_NAMES)),
        languageCodes: z.array(z.string()),
        timeTiers: z.array(z.enum(TIME_TIERS)),
        skills: z.array(z.object({ name: z.string(), version: z.string(), title: z.string() })),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'discovery',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    () => {
      const structured = {
        expandModes: [...EXPAND_MODES],
        deprecatedExpandModes: { ...DEPRECATED_EXPAND_MODES },
        encodings: [...ENCODING_NAMES],
        languageCodes: [...LANG_CODES],
        timeTiers: [...TIME_TIERS],
        skills: skills.map((skill) => ({
          name: skill.name,
          version: skill.version,
          title: skill.title,
        })),
      };
      const lines = [
        `expand modes: ${EXPAND_MODES.join(', ')}`,
        `deprecated aliases: ${Object.entries(DEPRECATED_EXPAND_MODES)
          .map(([from, to]) => `${from} → ${to}`)
          .join(', ')}`,
        `encodings: ${ENCODING_NAMES.join(', ')}`,
        `language codes: ${LANG_CODES.join(', ')}`,
        `time tiers: ${TIME_TIERS.join(', ')}`,
        `skills: ${skills.map((s) => `${s.name}@${s.version}`).join(', ') || 'none bundled'}`,
      ];
      return textResult(lines.join('\n'), structured);
    },
  );
}

function registerGetSkill(server: McpServer, skills: readonly SkillDescriptor[]): void {
  const names = skills.map((skill) => skill.name);
  server.registerTool(
    'get_skill',
    {
      title: 'Read a bundled skill contract',
      description:
        'Return a bundled skill document verbatim. Read the contract before acting on a skill’s behalf rather than reconstructing it from the skill name.',
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe(`Skill name. Bundled: ${names.join(', ') || '(none)'}.`),
        section: z
          .enum(SKILL_SECTIONS)
          .default('skill')
          .describe('`skill` for SKILL.md (the contract), `examples` for EXAMPLES.md.'),
      },
      outputSchema: {
        name: z.string(),
        section: z.enum(SKILL_SECTIONS),
        fileName: z.string(),
        content: z.string(),
        characters: z.number().int(),
      },
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: toolMeta({
        [`${META_NS}/category`]: 'discovery',
        [`${META_NS}/costHint`]: 'low',
      }),
    },
    ({ name, section }) => {
      try {
        const content = readSkillSection(name, section);
        return textResult(content, {
          name,
          section,
          fileName: skillSectionFileName(section),
          content,
          characters: content.length,
        });
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}

function registerSkillResources(server: McpServer, skills: readonly SkillDescriptor[]): void {
  const names = skills.map((skill) => skill.name);
  const fileNames = SKILL_SECTIONS.map(skillSectionFileName);

  server.registerResource(
    'skill-document',
    new ResourceTemplate('skill://{name}/{file}', {
      list: () => ({
        resources: skills.flatMap((skill) =>
          skill.sections.map((section) => ({
            uri: `skill://${skill.name}/${skillSectionFileName(section)}`,
            name: `${skill.name}/${skillSectionFileName(section)}`,
            title: `${skill.title} — ${section === 'skill' ? 'contract' : 'examples'}`,
            description:
              section === 'skill'
                ? skill.description
                : `Worked examples for the ${skill.name} skill.`,
            mimeType: 'text/markdown',
            annotations: {
              audience: ['assistant' as const],
              priority: section === 'skill' ? 0.9 : 0.5,
            },
            _meta: {
              [`${META_NS}/skill`]: skill.name,
              [`${META_NS}/skillVersion`]: skill.version,
            },
          })),
        ),
      }),
      complete: {
        name: (value) => names.filter((name) => name.startsWith(value)),
        file: (value) => fileNames.filter((file) => file.startsWith(value)),
      },
    }),
    {
      title: 'Bundled skill documents',
      description:
        'The SKILL.md contract and EXAMPLES.md worked examples for each bundled skill, served verbatim.',
      mimeType: 'text/markdown',
      annotations: { audience: ['assistant'], priority: 0.8 },
      _meta: { [`${META_NS}/category`]: 'skill' },
    },
    (uri, variables) => {
      const rawName = Array.isArray(variables['name']) ? variables['name'][0] : variables['name'];
      const rawFile = Array.isArray(variables['file']) ? variables['file'][0] : variables['file'];
      const section: SkillSection | undefined = SKILL_SECTIONS.find(
        (candidate) => skillSectionFileName(candidate) === rawFile,
      );
      // Resolve against the discovered list rather than re-deriving a path, so
      // `resources/read` can never succeed for something `resources/list` did
      // not advertise.
      const skill = skills.find((candidate) => candidate.name === rawName);
      if (skill === undefined || section === undefined || !skill.sections.includes(section)) {
        throw resourceError(
          uri.href,
          new Error(`expected skill://<name>/${fileNames.join(' or skill://<name>/')}`),
        );
      }
      try {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'text/markdown',
              text: readSkillSection(skill.name, section),
            },
          ],
        };
      } catch (err) {
        throw resourceError(uri.href, err);
      }
    },
  );
}

function registerBenchmarkResources(server: McpServer): void {
  server.registerResource(
    'benchmark-table',
    new ResourceTemplate('benchmark://{encoding}', {
      list: () => ({
        resources: ENCODING_NAMES.map((encoding) => ({
          uri: `benchmark://${encoding}`,
          name: `benchmark/${encoding}`,
          title: `Tokenization benchmark — ${encoding}`,
          description: `Languages and registers ranked by tokens-per-character under ${encoding}, measured over the bundled parallel corpus.`,
          mimeType: 'text/markdown',
          annotations: { audience: ['assistant' as const], priority: 0.7 },
          _meta: { [`${META_NS}/encoding`]: encoding },
        })),
      }),
      complete: {
        encoding: (value) => ENCODING_NAMES.filter((name) => name.startsWith(value)),
      },
    }),
    {
      title: 'Tokenization benchmark tables',
      description:
        'Precomputed ranking of every corpus language by token density, one resource per encoding.',
      mimeType: 'text/markdown',
      annotations: { audience: ['assistant'], priority: 0.7 },
      _meta: { [`${META_NS}/category`]: 'measurement' },
    },
    (uri, variables) => {
      const raw = Array.isArray(variables['encoding'])
        ? variables['encoding'][0]
        : variables['encoding'];
      const encoding = ENCODING_NAMES.find(
        (candidate): candidate is EncodingName => candidate === raw,
      );
      if (encoding === undefined) {
        throw resourceError(uri.href, new Error(`expected one of ${ENCODING_NAMES.join(', ')}`));
      }
      try {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'text/markdown',
              text: toMarkdown(runBenchmark(loadCorpus(), encoding)),
            },
          ],
        };
      } catch (err) {
        throw resourceError(uri.href, err);
      }
    },
  );
}

/**
 * Expose each bundled skill as an MCP prompt.
 *
 * WHY: a client that has the MCP server but not the skill files installed can
 * still enter a mode — the prompt ships the contract inline. `intensity` and
 * `input` are optional strings because the prompt-argument schema is
 * string-valued by protocol.
 */
function registerSkillPrompts(server: McpServer, skills: readonly SkillDescriptor[]): void {
  for (const skill of skills) {
    server.registerPrompt(
      skill.name,
      {
        title: `${skill.title} mode`,
        description: skill.description,
        argsSchema: {
          intensity: completable(
            z.string().optional().describe('Intensity level, if the skill defines them.'),
            (value) => ['lite', 'full', 'ultra'].filter((level) => level.startsWith(value ?? '')),
          ),
          input: z.string().optional().describe('Text or question to apply the mode to.'),
        },
      },
      ({ intensity, input }) => {
        let contract: string;
        try {
          contract = readSkillSection(skill.name, 'skill');
        } catch (err) {
          throw resourceError(`prompt:${skill.name}`, err);
        }
        const directives = [
          `Adopt the "${skill.name}" mode defined by the contract below. Follow it exactly, including its refusal and auto-revert boundaries.`,
          intensity === undefined || intensity === ''
            ? 'Use the skill’s default intensity.'
            : `Use intensity: ${intensity}.`,
          'The tokenmaxxingman MCP tools are available. Measure with `count_tokens` and `benchmark_languages` rather than estimating, and transform with `expand_text` or `maxx_text` rather than rewriting by hand.',
        ].join(' ');
        const messages = [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: `${directives}\n\n---\n\n${contract}` },
          },
        ];
        if (input !== undefined && input !== '') {
          messages.push({
            role: 'user' as const,
            content: { type: 'text' as const, text: input },
          });
        }
        return { messages };
      },
    );
  }
}

export interface CreateServerOptions {
  /** Override the discovered skill list. Used by tests. */
  skills?: readonly SkillDescriptor[];
}

/**
 * Build the tokenmaxxingman MCP server.
 *
 * Registration is eager and synchronous, so a client's very first `tools/list`
 * after `initialize` already sees the complete surface.
 *
 * Only `completions` is declared explicitly. `tools`, `resources`, and
 * `prompts` are derived by the SDK from what actually gets registered below —
 * declaring them by hand risks advertising a capability the registrations
 * contradict.
 */
export function createMcpServer(options: CreateServerOptions = {}): McpServer {
  const manifest = readManifest();
  const skills = options.skills ?? discoverSkills();

  const server = new McpServer(
    {
      name: manifest.name,
      title: 'tokenmaxxingman',
      version: manifest.version,
      description:
        'Deterministic token-expenditure tooling: measured prose inflation, a pinned-tokenizer benchmark of which human language tokenizes worst, and the bundled skill contracts.',
      websiteUrl: manifest.homepage,
      icons: [{ src: ICON_SRC, mimeType: 'image/svg+xml', sizes: ['any'] }],
    },
    {
      instructions: SERVER_INSTRUCTIONS,
      // `completions` is the only capability not derived from registrations.
      // `logging` is deliberately NOT declared: nothing here ever calls
      // `sendLoggingMessage`, and advertising it hands a client an empty log
      // pane it will wait on forever.
      capabilities: {
        completions: {},
      },
    },
  );

  registerExpandText(server);
  registerMaxxText(server);
  registerCountTokens(server);
  registerBenchmarkLanguages(server);
  registerPlanSpeedrun(server);
  registerPlanTokenBudget(server);
  registerListModes(server, skills);
  registerGetSkill(server, skills);

  registerSkillResources(server, skills);
  registerBenchmarkResources(server);
  registerSkillPrompts(server, skills);

  return server;
}
