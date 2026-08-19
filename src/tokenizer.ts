// The counters below come from `gpt-tokenizer`'s per-encoding entry points, which
// tree-shake to a single vocabulary each rather than pulling in every encoding.
import { countTokens as countCl100kTokens } from 'gpt-tokenizer/encoding/cl100k_base';
import { countTokens as countO200kTokens } from 'gpt-tokenizer/encoding/o200k_base';

export type EncodingName = 'cl100k_base' | 'o200k_base';

export interface TokenCount {
  tokens: number;
  /**
   * Unicode code points — NOT grapheme clusters.
   *
   * WHY code points: `tokensPerCharacter` is a published figure (the README,
   * CHANGELOG and skill docs quote e.g. Inuktitut `iu-cans` at 2.6158 tok/char
   * under cl100k_base), and every one of those numbers was produced with a
   * code-point denominator. Switching to `granularity: 'grapheme'` would silently
   * change the denominator — `'👨‍👩‍👧‍👦'` is 7 code points but 1 grapheme, `'🇯🇵'` is
   * 2 code points but 1 grapheme — invalidating the published corpus figures
   * while looking like a no-op. Code points are also the denominator tiktoken-era
   * comparisons in the literature use, so they stay.
   *
   * Consequence to be aware of when reading the metric: for emoji-heavy or
   * heavily-combining text, `characters` over-counts what a human would call a
   * character, so `tokensPerCharacter` reads lower than a grapheme-based ratio
   * would. The bundled corpus contains no emoji, so the published figures are
   * unaffected either way.
   */
  characters: number;
  /** UTF-8 byte length. */
  bytes: number;
  /**
   * Word-like segments per `Intl.Segmenter`. Zero is a legitimate result, not an
   * error: punctuation-only and emoji-only text has no word-like segments at all
   * (`'。、！？…—'` and `'🎉'` both segment to 0). Consumers dividing by this must
   * decide what a zero denominator means — see `runBenchmark` in `benchmark.ts`.
   */
  words: number;
  encoding: EncodingName;
}

/**
 * Token counters, keyed by vocabulary.
 *
 * WHY `countTokens` and not `encode`: `encode()` accumulates the token ids with
 * `Array.prototype.push(...tokens)`, and spreading a large array as arguments
 * overflows the V8 call stack — `encode()` throws
 * `RangeError: Maximum call stack size exceeded` at roughly 42,000 `👍`, and on
 * ~96,000 characters of unspaced Inuktitut Syllabics, i.e. well inside the
 * 100,000-character ceiling the MCP layer advertises. `countTokens()` runs the
 * identical pre-tokenisation and byte-pair-encoding path (`countNative` vs
 * `encodeNative` in `BytePairEncodingCore`) and only increments a counter, so it
 * is stack-safe AND returns exactly the same number for every input `encode()`
 * can handle. Counting rather than chunking is what keeps it exact: any
 * slice-and-sum strategy risks cutting inside a byte-pair-encoded pre-token and
 * shifting the count, which would invalidate the published benchmark figures.
 */
const tokenCounters: Readonly<Record<EncodingName, (text: string) => number>> = {
  cl100k_base: countCl100kTokens,
  o200k_base: countO200kTokens,
};

// Hoisted: constructing a TextEncoder per call is pure overhead in the benchmark's
// inner loop, and the instance is stateless.
const utf8 = new TextEncoder();

/**
 * Build a word segmenter for `locale`, falling back to English.
 *
 * WHY the fallback is pinned to `'en'` and not `undefined`: `undefined` resolves
 * to the host's default locale (whatever `LANG`/ICU says), which would make word
 * counts — and therefore the `tokensPerWord` ranking — depend on the machine that
 * ran the benchmark. Determinism is this project's central claim, so the fallback
 * is an explicit constant. Corpus codes such as `zh-classical` genuinely throw
 * `RangeError` in `Intl.Segmenter` and take this path.
 */
function makeSegmenter(locale?: string): Intl.Segmenter {
  try {
    return new Intl.Segmenter(locale, { granularity: 'word' });
  } catch {
    return new Intl.Segmenter('en', { granularity: 'word' });
  }
}

export function countTokens(text: string, encoding: EncodingName, locale?: string): TokenCount {
  const countEncodedTokens = tokenCounters[encoding];
  const words = [...makeSegmenter(locale).segment(text)].filter((s) => s.isWordLike).length;
  return {
    tokens: countEncodedTokens(text),
    characters: [...text].length,
    bytes: utf8.encode(text).length,
    words,
    encoding,
  };
}
