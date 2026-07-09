#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { program } from 'commander';
import type { ExpandMode } from './expand.js';
import type { EncodingName } from './tokenizer.js';
import type { TimeTier } from './speedrun.js';
import type { Corpus } from './corpus-types.js';
import { expand } from './expand.js';
import { runBenchmark } from './benchmark.js';
import { toMarkdown } from './formatters/markdown.js';
import { toJson } from './formatters/json.js';
import { speedrun, tierToMs } from './speedrun.js';
import { maxxer, maxxerParallel } from './maxxer.js';
import { targets as LANG_CODES } from './transforms/translate.js';
import type { LangCode } from './transforms/translate.js';

const EXPAND_MODES: readonly ExpandMode[] = [
  'verbose-lite',
  'verbose-full',
  'verbose-ultra',
  'verbose-galactic',
  'translate-burmese',
  'translate-tibetan',
  'translate-inuktitut',
  'anti-wenyan',
];

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
    return new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      process.stdin.on('error', reject);
    });
  }
  return readFile(file, 'utf-8');
}

// import.meta.url resolves correctly after npm install -g; __dirname would point to the wrong place.
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCorpus(): Corpus {
  const corpusPath = resolve(__dirname, '../data/corpus.json');
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(corpusPath, 'utf-8'));
  } catch {
    console.error(`Error: failed to parse corpus.json`);
    process.exit(1);
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as Record<string, unknown>)['version'] !== '1' ||
    !Array.isArray((parsed as Record<string, unknown>)['languages']) ||
    !Array.isArray((parsed as Record<string, unknown>)['sentences'])
  ) {
    console.error(`Error: corpus.json has unexpected structure (expected version "1")`);
    process.exit(1);
  }
  return parsed as Corpus;
}

let pkg: { version: string };
try {
  const rawPkg: unknown = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
  if (
    typeof rawPkg !== 'object' ||
    rawPkg === null ||
    typeof (rawPkg as Record<string, unknown>)['version'] !== 'string'
  ) {
    console.error(`Error: package.json has unexpected structure`);
    process.exit(1);
  }
  pkg = rawPkg as { version: string };
} catch {
  console.error(`Error: failed to parse package.json`);
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
      const maxIterations = parseInt(opts.maxIterations, 10);
      if (isNaN(maxIterations) || maxIterations < 1) {
        console.error('Error: --max-iterations must be a positive integer');
        process.exit(2);
      }

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

function validateIntInRange(raw: string, flag: string, min: number, max: number): number {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < min || n > max) {
    console.error(`Error: ${flag} must be an integer between ${min} and ${max}`);
    process.exit(2);
  }
  return n;
}

program
  .command('maxxer')
  .description('Apply EVERY token-burning trick to input text.')
  .argument('[file]', 'input file (omit or use - for stdin)')
  .option('--passes <n>', 'pipeline passes (1-5)', '1')
  .option('--padding-multiplier <n>', 'essay-padding multiplier', '3')
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
      const paddingMultiplier = parseInt(opts.paddingMultiplier, 10);
      if (isNaN(paddingMultiplier) || paddingMultiplier < 1) {
        console.error('Error: --padding-multiplier must be a positive integer');
        process.exit(2);
      }
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

program.parse();
