import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Corpus } from '../src/corpus-types.js';
import type { BenchmarkResult } from '../src/benchmark.js';
import { runBenchmark } from '../src/benchmark.js';
import { toMarkdown } from '../src/formatters/markdown.js';
import { toJson } from '../src/formatters/json.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpusPath = resolve(__dirname, '../data/corpus.json');
const corpus = JSON.parse(readFileSync(corpusPath, 'utf-8')) as Corpus;

describe('runBenchmark', () => {
  it('returns exactly 18 rows', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    expect(result.rows).toHaveLength(18);
  });

  it('rows are sorted descending by tokensPerCharacter', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    for (let i = 0; i < result.rows.length - 1; i++) {
      const current = result.rows[i];
      const next = result.rows[i + 1];
      expect(current?.tokensPerCharacter).toBeGreaterThanOrEqual(next?.tokensPerCharacter ?? 0);
    }
  });

  it('rank matches array index + 1', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    result.rows.forEach((row, index) => {
      expect(row.rank).toBe(index + 1);
    });
  });

  it('zh-classical ranks in the bottom half (is a token-efficiency language, not a token-maximiser)', () => {
    // The plan predicted zh-classical would rank last, but empirically legalese/Victorian English
    // register variants have far lower tok/char ratios because they use many more Latin characters
    // per unit of meaning. zh-classical ranks roughly mid-table; the actual token-minimisation
    // champions are en-legalese and en-victorian. This test asserts the empirically correct property.
    const result = runBenchmark(corpus, 'cl100k_base');
    const midpoint = result.rows.length / 2;
    const classical = result.rows.find((r) => r.code === 'zh-classical');
    expect(classical, 'zh-classical entry missing from benchmark rows').toBeDefined();
    expect(
      classical?.rank,
      `Expected zh-classical to rank in the bottom half (rank > ${midpoint}), ` +
        `confirming it is more token-efficient than most non-Latin scripts. ` +
        `If this fails, the tokenizer vocabulary coverage for Han characters may have changed.`,
    ).toBeGreaterThan(midpoint);
  });

  it('is deterministic: two runs produce identical rows (excluding generatedAt)', () => {
    const stripTimestamp = (r: BenchmarkResult) => r.rows;
    const first = stripTimestamp(runBenchmark(corpus, 'cl100k_base'));
    const second = stripTimestamp(runBenchmark(corpus, 'cl100k_base'));
    expect(first).toEqual(second);
  });

  it('cl100k_base produces valid 18-row result', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    expect(result.encoding).toBe('cl100k_base');
    expect(result.rows).toHaveLength(18);
    expect(result.corpusVersion).toBe('1');
  });

  it('o200k_base produces valid 18-row result', () => {
    const result = runBenchmark(corpus, 'o200k_base');
    expect(result.encoding).toBe('o200k_base');
    expect(result.rows).toHaveLength(18);
    expect(result.corpusVersion).toBe('1');
  });
});

describe('toMarkdown', () => {
  it('contains the rank-1 language name', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    const rankOne = result.rows[0];
    expect(rankOne).toBeDefined();
    const output = toMarkdown(result);
    expect(output).toContain(rankOne?.name ?? '');
  });

  it('contains the Tok/Char header', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    const output = toMarkdown(result);
    expect(output).toContain('Tok/Char');
  });
});

describe('toJson', () => {
  it('pretty: true produces valid JSON parseable by JSON.parse', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    const output = toJson(result, { pretty: true });
    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output) as BenchmarkResult;
    expect(parsed.rows).toHaveLength(18);
  });

  it('default (compact) produces valid JSON', () => {
    const result = runBenchmark(corpus, 'cl100k_base');
    const output = toJson(result);
    expect(() => JSON.parse(output)).not.toThrow();
  });
});

// Gap tests: benchmark.ts sort comparator branches (lines 64-67)
describe('runBenchmark sort tiebreaker branches', () => {
  // Gap: totalCharacters === 0 → tokensPerCharacter = 0.
  // A language code present in languages[] but with no matching translations.
  it('assigns tokensPerCharacter of 0 for a language with no translations', () => {
    const sparseCorpus = {
      version: '1' as const,
      description: 'minimal caveats corpus',
      sentences: [
        { id: 's01', english: 'Hello.', translations: { en: 'Hello.' } },
      ],
      languages: [
        { code: 'en', name: 'English', family: 'natural' as const, script: 'Latin', notes: '' },
        // 'zz' has no matching translation → totalCharacters === 0 → tokensPerCharacter = 0
        { code: 'zz', name: 'Zero', family: 'natural' as const, script: 'Latin', notes: '' },
      ],
    };
    const result = runBenchmark(sparseCorpus, 'cl100k_base');
    const zzRow = result.rows.find((r) => r.code === 'zz');
    expect(zzRow).toBeDefined();
    expect(zzRow?.tokensPerCharacter).toBe(0);
  });

  // Gap: sentenceCount === 0 → tokensPerSentence = 0.
  it('assigns tokensPerSentence of 0 when sentences array is empty', () => {
    const emptyCorpus = {
      version: '1' as const,
      description: 'empty caveats corpus',
      sentences: [],
      languages: [
        { code: 'en', name: 'English', family: 'natural' as const, script: 'Latin', notes: '' },
      ],
    };
    const result = runBenchmark(emptyCorpus, 'cl100k_base');
    expect(result.rows[0]?.tokensPerSentence).toBe(0);
  });

  // Gap: secondary sort branch — two languages with identical tokensPerCharacter but
  // different tokensPerSentence. The one with higher tokensPerSentence ranks first.
  it('breaks tokensPerCharacter ties by tokensPerSentence (higher ranks first)', () => {
    // Craft identical tok/char ratios but different total tokens across 1 vs 2 sentences.
    // Both languages get 1 token per character. Language 'aa' accumulates across 2 sentences,
    // language 'bb' only has one sentence. aa.tokPerSent > bb.tokPerSent → aa ranks higher.
    const tieCorpus = {
      version: '1' as const,
      description: 'tiebreaker caveats corpus',
      sentences: [
        { id: 's01', english: 'A.', translations: { aa: 'A.', bb: 'A.' } },
        { id: 's02', english: 'B.', translations: { aa: 'B.' } },
      ],
      languages: [
        { code: 'aa', name: 'A', family: 'natural' as const, script: 'Latin', notes: '' },
        { code: 'bb', name: 'B', family: 'natural' as const, script: 'Latin', notes: '' },
      ],
    };
    const result = runBenchmark(tieCorpus, 'cl100k_base');
    const aaRank = result.rows.find((r) => r.code === 'aa')?.rank ?? Infinity;
    const bbRank = result.rows.find((r) => r.code === 'bb')?.rank ?? Infinity;
    // 'aa' has more tokens across 2 sentences → higher tokensPerSentence → should rank 1 (lower rank number)
    expect(aaRank).toBeLessThan(bbRank);
  });

  // Gap: tertiary sort (localeCompare) — two languages with identical tokensPerCharacter AND
  // identical tokensPerSentence. Alphabetically earlier code ranks first.
  it('breaks full ties alphabetically by language code', () => {
    const fullTieCorpus = {
      version: '1' as const,
      description: 'full tie caveats corpus',
      sentences: [
        { id: 's01', english: 'Hi.', translations: { aa: 'Hi.', bb: 'Hi.' } },
      ],
      languages: [
        { code: 'bb', name: 'B', family: 'natural' as const, script: 'Latin', notes: '' },
        { code: 'aa', name: 'A', family: 'natural' as const, script: 'Latin', notes: '' },
      ],
    };
    const result = runBenchmark(fullTieCorpus, 'cl100k_base');
    // 'aa' < 'bb' alphabetically → 'aa' should rank 1
    expect(result.rows[0]?.code).toBe('aa');
    expect(result.rows[1]?.code).toBe('bb');
  });
});
