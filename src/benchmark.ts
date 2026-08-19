import type { Corpus, LangCode } from './corpus-types.js';
import type { EncodingName } from './tokenizer.js';
import { countTokens } from './tokenizer.js';

export interface BenchmarkRow {
  code: LangCode;
  name: string;
  family: 'natural' | 'register';
  script: string;
  totalTokens: number;
  totalCharacters: number;
  totalBytes: number;
  totalWords: number;
  sentenceCount: number;
  /** Tokens per Unicode code point. See `ratio` for the zero-denominator semantics. */
  tokensPerCharacter: number;
  /** Tokens per word-like segment. See `ratio` for the zero-denominator semantics. */
  tokensPerWord: number;
  /** Tokens per corpus sentence. See `ratio` for the zero-denominator semantics. */
  tokensPerSentence: number;
  rank: number;
}

export interface BenchmarkResult {
  encoding: EncodingName;
  corpusVersion: string;
  rows: BenchmarkRow[];
}

/**
 * A published density metric, with the two zero-denominator cases kept distinct.
 *
 * WHY not the old `denominator === 0 ? 0 : …` guard: it collapsed two different
 * facts into the same misleading number. `Intl.Segmenter` yields zero word-like
 * segments for punctuation-only and emoji-only text, so an unsegmentable script
 * can have many tokens and zero words — the most token-dense case there is — and
 * reporting `0` tokens-per-word sorted it *last*, exactly inverting the headline
 * ranking. The semantics are therefore:
 *
 * - denominator > 0            → the ratio.
 * - denominator 0, tokens > 0  → `+Infinity`: the cost per unit is unbounded, not
 *                                zero. Sorts above every finite ratio, and
 *                                `JSON.stringify` renders it as `null` rather
 *                                than as a number that reads as "cheapest".
 * - denominator 0, tokens 0    → `NaN`: genuinely undefined, there is no data.
 *                                Also serialises to `null`, and sorts last.
 *
 * Both sentinels fall out of IEEE-754 division, so this is plain arithmetic with
 * the guard removed; the comment exists because the *absence* of a guard is the
 * deliberate part. `sortDescending` below is total over both sentinels.
 */
function ratio(numerator: number, denominator: number): number {
  return numerator / denominator;
}

/**
 * Descending comparator that is total: never returns `NaN`, so `Array#sort` stays
 * a well-defined (and therefore deterministic) ordering even when a row carries a
 * `NaN` "no data" ratio. `NaN` sorts last; `+Infinity` sorts first via `>`.
 */
function sortDescending(a: number, b: number): number {
  const aMissing = Number.isNaN(a);
  const bMissing = Number.isNaN(b);
  if (aMissing || bMissing) {
    return aMissing === bMissing ? 0 : aMissing ? 1 : -1;
  }
  return a === b ? 0 : a > b ? -1 : 1;
}

/**
 * Codepoint comparator for the final tie-break.
 *
 * WHY not `localeCompare`: default-locale collation is ICU-version and
 * host-dependent, and treats punctuation as variable-weight — precisely the
 * characters in codes like `en-legalese`, `zh-classical` and `iu-cans`. Two runs
 * on different hosts could therefore order an exact tie differently, which breaks
 * the byte-identical-output guarantee. `<`/`>` on strings is UTF-16 codepoint
 * order: fixed, locale-free, reproducible.
 */
function compareCodes(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function runBenchmark(corpus: Corpus, encoding: EncodingName): BenchmarkResult {
  const unranked: ReadonlyArray<Omit<BenchmarkRow, 'rank'>> = corpus.languages.map((lang) => {
    let totalTokens = 0;
    let totalCharacters = 0;
    let totalBytes = 0;
    let totalWords = 0;
    let sentenceCount = 0;

    for (const sentence of corpus.sentences) {
      const text = sentence.translations[lang.code];
      if (text === undefined) continue;
      sentenceCount += 1;
      const counted = countTokens(text, encoding, lang.code);
      totalTokens += counted.tokens;
      totalCharacters += counted.characters;
      totalBytes += counted.bytes;
      totalWords += counted.words;
    }

    return {
      code: lang.code,
      name: lang.name,
      family: lang.family,
      script: lang.script,
      totalTokens,
      totalCharacters,
      totalBytes,
      totalWords,
      sentenceCount,
      tokensPerCharacter: ratio(totalTokens, totalCharacters),
      tokensPerWord: ratio(totalTokens, totalWords),
      tokensPerSentence: ratio(totalTokens, sentenceCount),
    };
  });

  // Tokens-per-word is the headline metric, so it leads; density and per-sentence
  // cost break ties, and the code breaks a full tie deterministically.
  const sorted = [...unranked].sort(
    (a, b) =>
      sortDescending(a.tokensPerWord, b.tokensPerWord) ||
      sortDescending(a.tokensPerCharacter, b.tokensPerCharacter) ||
      sortDescending(a.tokensPerSentence, b.tokensPerSentence) ||
      compareCodes(a.code, b.code),
  );

  const rows: BenchmarkRow[] = sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  return {
    encoding,
    corpusVersion: corpus.version,
    rows,
  };
}
