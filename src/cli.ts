#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { program } from 'commander';
import type { ExpandMode } from './expand.js';
import type { EncodingName } from './tokenizer.js';
import type { TimeTier } from './speedrun.js';
import type { Corpus } from './corpus-types.js';
import { EXPAND_MODES, expand } from './expand.js';
import { loadCorpus as loadCorpusOrThrow } from './corpus.js';
import { readManifest } from './paths.js';
import { TOKEN_TARGETS, planTokenBudget } from './mcp/speedrun-plan.js';
import { runBenchmark } from './benchmark.js';
import { toMarkdown } from './formatters/markdown.js';
import { toJson } from './formatters/json.js';
import { speedrun, tierToMs } from './speedrun.js';
import { maxxer, maxxerParallel } from './maxxer.js';
import { targets as LANG_CODES } from './transforms/translate.js';
import type { LangCode } from './transforms/translate.js';

const ENCODING_NAMES: readonly EncodingName[] = ['cl100k_base', 'o200k_base'];

const TIME_TIERS: readonly TimeTier[] = ['sprint-1m', 'sprint-5m', 'sprint-10m', 'sprint-1h'];

function parseDuration(value: string): number {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/.exec(value);
  if (match === null) {
    console.error(`Error: invalid duration "${value}" — expected format like 30s, 5m, 1h, 500ms`);
    process.exit(2);
  }
  const raw = match[1];
  if (raw === undefined) {
    console.error(`Error: invalid duration "${value}"`);
    process.exit(2);
  }
  const n = parseFloat(raw);
  switch (match[2]) {
    case 'ms':
      return n;
    case 's':
      return n * 1_000;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    default:
      // Unreachable: the regex only admits ms|s|m|h. Fail loudly rather than
      // silently returning an unconverted count if the pattern ever changes.
      console.error(`Error: unsupported duration unit in "${value}"`);
      process.exit(2);
  }
}

function validateExpandMode(raw: string): ExpandMode {
  if ((EXPAND_MODES as readonly string[]).includes(raw)) {
    return raw as ExpandMode;
  }
  console.error(`Error: invalid mode "${raw}" — valid modes: ${EXPAND_MODES.join(', ')}`);
  process.exit(2);
}

function validateEncoding(raw: string): EncodingName {
  if ((ENCODING_NAMES as readonly string[]).includes(raw)) {
    return raw as EncodingName;
  }
  console.error(`Error: invalid encoding "${raw}" — valid encodings: ${ENCODING_NAMES.join(', ')}`);
  process.exit(2);
}

function validateTier(raw: string): TimeTier {
  if ((TIME_TIERS as readonly string[]).includes(raw)) {
    return raw as TimeTier;
  }
  console.error(`Error: invalid tier "${raw}" — valid tiers: ${TIME_TIERS.join(', ')}`);
  process.exit(2);
}

async function readInput(file: string | undefined): Promise<string> {
  if (file === undefined || file === '-') {
    // An interactive terminal with nothing piped in will never send EOF, so
    // awaiting stdin here hung forever with no prompt and no hint — the user just
    // saw a dead cursor. Tell them how to supply input instead.
    if (process.stdin.isTTY === true) {
      console.error(
        'Error: no input. Pipe text in (echo "text" | tokenmaxxingman expand) or pass a file path.',
      );
      process.exit(2);
    }
    return new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      process.stdin.on('error', reject);
    });
  }
  return readFile(file, 'utf-8');
}

function loadCorpus(): Corpus {
  try {
    return loadCorpusOrThrow();
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

let pkg: { version: string };
try {
  pkg = readManifest();
} catch (err) {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

program
  .name('tokenmaxxingman')
  .description('Deterministic, composable token maximisation tooling.')
  .version(pkg.version);

program
  .command('expand')
  .description('Expand text using a verbosity or translation pipeline.')
  .argument('[file]', 'input file (omit or use - for stdin)')
  .option('-m, --mode <mode>', `expand mode: ${EXPAND_MODES.join(' | ')}`, 'verbose-full')
  .action(async (file: string | undefined, opts: { mode: string }) => {
    const mode = validateExpandMode(opts.mode);
    try {
      const input = await readInput(file);
      const output = expand(input, mode);
      process.stdout.write(output + '\n');
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program
  .command('benchmark')
  .description('Run the tokenisation benchmark against the bundled corpus.')
  .option('-f, --format <fmt>', 'output format: markdown | json', 'markdown')
  .option(
    '-e, --encoding <enc>',
    `tokenizer encoding: ${ENCODING_NAMES.join(' | ')}`,
    'cl100k_base',
  )
  .option('--pretty', 'pretty-print JSON output (only applies when --format json)')
  .action((opts: { format: string; encoding: string; pretty: boolean }) => {
    const encoding = validateEncoding(opts.encoding);
    const format = opts.format;
    if (format !== 'markdown' && format !== 'json') {
      console.error(`Error: invalid format "${format}" — valid formats: markdown, json`);
      process.exit(2);
    }
    try {
      const corpus = loadCorpus();
      const result = runBenchmark(corpus, encoding);
      const output =
        format === 'json' ? toJson(result, { pretty: opts.pretty }) : toMarkdown(result);
      process.stdout.write(output + '\n');
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program
  .command('speedrun')
  .description('Run the token-generation speedrun for a given time budget.')
  .option('-t, --time <duration>', 'duration budget (e.g. 30s, 5m, 1h)')
  .option('--tier <tier>', `predefined time tier: ${TIME_TIERS.join(' | ')}`)
  .option('-m, --mode <mode>', 'expand mode', 'verbose-ultra')
  .option('-s, --seed <text>', 'starting text', 'Hello, world.')
  .option('-e, --encoding <enc>', 'tokenizer encoding', 'cl100k_base')
  .option('--max-iterations <n>', 'safety cap on iterations', '10000')
  .option('--format <fmt>', 'output format: summary | json', 'summary')
  .action(
    (opts: {
      time?: string;
      tier?: string;
      mode: string;
      seed: string;
      encoding: string;
      maxIterations: string;
      format: string;
    }) => {
      let durationMs: number;
      if (opts.time !== undefined) {
        durationMs = parseDuration(opts.time);
      } else if (opts.tier !== undefined) {
        const tier = validateTier(opts.tier);
        durationMs = tierToMs(tier);
      } else {
        console.error('Error: one of --time or --tier is required');
        process.exit(2);
      }

      const mode = validateExpandMode(opts.mode);
      const encoding = validateEncoding(opts.encoding);
      const maxIterations = validatePositiveInt(opts.maxIterations, '--max-iterations');

      const format = opts.format;
      if (format !== 'summary' && format !== 'json') {
        console.error(`Error: invalid format "${format}" — valid formats: summary, json`);
        process.exit(2);
      }

      try {
        const result = speedrun({ durationMs, seed: opts.seed, mode, encoding, maxIterations });

        if (format === 'json') {
          process.stdout.write(JSON.stringify(result, null, 2) + '\n');
        } else {
          const preview =
            result.finalOutput.length > 200
              ? result.finalOutput.slice(0, 200) + '...'
              : result.finalOutput;
          const lines = [
            `tokenmaxxingman speedrun`,
            `  mode       : ${result.mode}`,
            `  encoding   : ${result.encoding}`,
            `  time       : ${result.durationMs.toFixed(1)}ms / budget ${result.budgetMs}ms`,
            `  iterations : ${result.iterations}${result.hitMaxIterations ? ' (hit cap)' : ''}`,
            `  tokens     : ${result.totalTokens}`,
            `  tokens/sec : ${result.tokensPerSecond.toFixed(1)}`,
            `  chars/sec  : ${result.charactersPerSecond.toFixed(1)}`,
            `  preview    : ${preview}`,
          ];
          process.stdout.write(lines.join('\n') + '\n');
        }
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    },
  );

function validateLangCode(raw: string): LangCode {
  if (LANG_CODES.includes(raw)) {
    return raw;
  }
  console.error(`Error: invalid target-language "${raw}" — valid codes: ${LANG_CODES.join(', ')}`);
  process.exit(2);
}

/**
 * Parse a non-negative integer flag, rejecting anything that is not purely
 * digits.
 *
 * WHY not `parseInt`: it stops at the first non-digit and returns what it has, so
 * `--passes 3abc` was silently accepted as 3 and `--max-iterations 1e10` became
 * **1** — the flag appeared to ask for ten billion iterations and actually asked
 * for one. Failing loudly beats quietly doing something else.
 */
function parseIntegerFlag(raw: string, flag: string): number {
  if (!/^\d+$/.test(raw.trim())) {
    console.error(`Error: ${flag} must be a whole number (got "${raw}")`);
    process.exit(2);
  }
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isSafeInteger(n)) {
    console.error(`Error: ${flag} is too large`);
    process.exit(2);
  }
  return n;
}

function validateIntInRange(raw: string, flag: string, min: number, max: number): number {
  const n = parseIntegerFlag(raw, flag);
  if (n < min || n > max) {
    console.error(`Error: ${flag} must be an integer between ${min} and ${max}`);
    process.exit(2);
  }
  return n;
}

function validatePositiveInt(raw: string, flag: string): number {
  const n = parseIntegerFlag(raw, flag);
  if (n < 1) {
    console.error(`Error: ${flag} must be at least 1`);
    process.exit(2);
  }
  return n;
}

program
  .command('maxxer')
  .description('Apply EVERY token-burning trick to input text.')
  .argument('[file]', 'input file (omit or use - for stdin)')
  .option('--passes <n>', 'pipeline passes (1-5)', '1')
  .option('--padding-multiplier <n>', 'essay-padding multiplier (1-20)', '3')
  .option('--target-language <code>', 'final translate pass language code (e.g. my, bo, iu-cans)')
  .option('--parallel', 'use maxxerParallel instead of maxxer')
  .action(
    async (
      file: string | undefined,
      opts: {
        passes: string;
        paddingMultiplier: string;
        targetLanguage?: string;
        parallel?: true;
      },
    ) => {
      const passes = validateIntInRange(opts.passes, '--passes', 1, 5);
      // Bounded to the same 1-20 range the MCP `maxx_text` tool enforces, so the
      // two entry points cannot disagree. Unbounded, this reached 240 MB of
      // output from two sentences.
      const paddingMultiplier = validateIntInRange(
        opts.paddingMultiplier,
        '--padding-multiplier',
        1,
        20,
      );
      const targetLanguage: LangCode | undefined =
        opts.targetLanguage !== undefined ? validateLangCode(opts.targetLanguage) : undefined;

      const maxxerOpts = {
        passes,
        paddingMultiplier,
        ...(targetLanguage !== undefined ? { targetLanguage } : {}),
      };

      try {
        const input = await readInput(file);
        const output =
          opts.parallel === true
            ? await maxxerParallel(input, maxxerOpts)
            : maxxer(input, maxxerOpts);
        process.stdout.write(output + '\n');
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    },
  );

const TOKEN_TARGET_NAMES = ['million', 'billion', 'trillion'] as const;

program
  .command('budget')
  .description('Project what a token target would cost in time, conversations, and bytes.')
  .option('--target <name>', `named target: ${TOKEN_TARGET_NAMES.join(' | ')}`)
  .option('--target-tokens <n>', 'explicit token target')
  .option('--context-window <n>', 'context window used to count conversations', '200000')
  .option('-e, --encoding <enc>', 'tokenizer encoding', 'cl100k_base')
  .option('--format <fmt>', 'output format: summary | json', 'summary')
  .action(
    (opts: {
      target?: string;
      targetTokens?: string;
      contextWindow: string;
      encoding: string;
      format: string;
    }) => {
      if (opts.target === undefined && opts.targetTokens === undefined) {
        console.error('Error: one of --target or --target-tokens is required');
        process.exit(2);
      }
      if (opts.target !== undefined && opts.targetTokens !== undefined) {
        console.error('Error: --target and --target-tokens are mutually exclusive');
        process.exit(2);
      }

      let targetTokens: number;
      if (opts.target !== undefined) {
        if (!(TOKEN_TARGET_NAMES as readonly string[]).includes(opts.target)) {
          console.error(
            `Error: invalid target "${opts.target}" — valid targets: ${TOKEN_TARGET_NAMES.join(', ')}`,
          );
          process.exit(2);
        }
        targetTokens = TOKEN_TARGETS[opts.target as (typeof TOKEN_TARGET_NAMES)[number]];
      } else {
        targetTokens = validatePositiveInt(opts.targetTokens ?? '', '--target-tokens');
      }

      const contextWindow = validatePositiveInt(opts.contextWindow, '--context-window');
      const encoding = validateEncoding(opts.encoding);
      const format = opts.format;
      if (format !== 'summary' && format !== 'json') {
        console.error(`Error: invalid format "${format}" — valid formats: summary, json`);
        process.exit(2);
      }

      try {
        const plan = planTokenBudget(targetTokens, encoding, contextWindow);
        if (format === 'json') {
          process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
          return;
        }
        const lines = [
          `tokenmaxxingman budget`,
          `  target        : ${plan.targetTokens.toLocaleString('en-US')} tokens`,
          `  encoding      : ${plan.encoding}`,
          `  throughput    : ${plan.assumedTokensPerSecond.toFixed(1)} tokens/sec (highest published tier)`,
          `  time required : ${plan.requiredHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} hours (${plan.requiredYears.toFixed(2)} years)`,
          `  conversations : ${plan.conversationsRequired.toLocaleString('en-US')} at ${plan.contextWindowTokens.toLocaleString('en-US')} tokens each`,
          `  text volume   : ~${plan.estimatedTerabytes.toFixed(3)} TB`,
          `  one context   : ${plan.fitsInOneContext ? 'yes' : 'no'}`,
          ``,
          `  ${plan.verdict}`,
        ];
        process.stdout.write(lines.join('\n') + '\n');
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    },
  );

program
  .command('mcp')
  // `npx -y tokenmaxxingman tmm-mcp` resolves the package's default bin and
  // passes `tmm-mcp` as argv[2], so the alias makes the documented npx form work
  // identically to the dedicated `tmm-mcp` bin.
  .alias('tmm-mcp')
  .description('Run the Model Context Protocol server on stdio.')
  .action(async () => {
    // Imported lazily: the SDK pulls in a non-trivial module graph that the
    // other subcommands never touch. Note this imports `run.js`, not `bin.js` —
    // `bin.js` starts a server as an import side effect.
    const { runStdioServer } = await import('./mcp/run.js');
    await runStdioServer();
  });

program.parse();
