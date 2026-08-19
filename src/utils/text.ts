export function applyCase(original: string, replacement: string): string {
  if (original.length === 0) return replacement;
  // charAt always returns a string (never undefined), so no index guard is
  // needed here despite noUncheckedIndexedAccess.
  const firstChar = original.charAt(0);
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// ---------------------------------------------------------------------------
// Unicode-aware whole-word matching
// ---------------------------------------------------------------------------

// `\b` and `\w` are defined over ASCII [A-Za-z0-9_] only, so a `\bword\b`
// pattern treats every non-Latin character as a non-word character. That is
// actively wrong for this project, which deliberately round-trips Burmese,
// Tibetan, and Inuktitut Syllabics: `\buse\b` happily matched the "use" inside
// "ᐊᐃuse" and "မuseမ", and — worse — a `\b` before a combining mark let a
// substitution strand an orphaned U+0301 that then re-attached to the tail of
// the replacement text, corrupting a grapheme the pattern never matched.
//
// Lookarounds over the explicit property classes fix both: `\p{L}` covers every
// script's letters, `\p{N}` digits, and `\p{M}` combining marks — the last of
// which is what keeps NFD input from being split mid-grapheme. `_` is retained
// so identifier-like tokens behave as they did under `\w`.
const WORD_CHARACTER = '[\\p{L}\\p{M}\\p{N}_]';

/**
 * Escape every character with special meaning inside a regular expression so an
 * arbitrary literal can be interpolated into a pattern safely. The current
 * call sites all pass static internal table keys, but that is an invariant of
 * today's data, not of the function.
 */
export function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Build a global, case-insensitive, Unicode-aware pattern that matches any of
 * `words` only when it stands as a complete word. Callers use the matched text
 * (not capture groups) so no capturing group is emitted.
 */
export function wholeWordPattern(words: readonly string[]): RegExp {
  const alternatives = words.map(escapeRegExp).join('|');
  return new RegExp(`(?<!${WORD_CHARACTER})(?:${alternatives})(?!${WORD_CHARACTER})`, 'giu');
}

// ---------------------------------------------------------------------------
// Sentence segmentation
// ---------------------------------------------------------------------------

// The locale is pinned rather than left to the host default: `Intl.Segmenter`
// with `undefined` resolves against the process locale (LANG/LC_ALL and the
// embedded ICU build), and byte-identical deterministic output across machines
// is this project's core promise. `Intl.Segmenter` is already the segmentation
// primitive used by src/tokenizer.ts, so this adds no dependency.
const SENTENCE_SEGMENTER = new Intl.Segmenter('en', { granularity: 'sentence' });

// UAX #29 (SB8) already keeps "Fig. 1", "vs. the", "e.g. this", and decimals
// such as "3. 14159" inside a single sentence, which the previous
// `/(?<=[.!?])\s+/` split shredded. What UAX #29 deliberately does NOT do is
// suppress a break when an abbreviation is followed by a capitalised word
// ("Dr. Smith", "pp. 1,492", "cf. Flibbertigibbet"): that requires CLDR's
// sentence-break suppression list, and V8 does not wire ICU's filtered break
// iterator into `Intl.Segmenter` — `en-u-ss-standard` is accepted as a locale
// but changes nothing. So the suppression list is supplied here.
//
// Entries are stored without their trailing period and compared lower-cased.
const NON_TERMINAL_ABBREVIATIONS: ReadonlySet<string> = new Set([
  // Titles and honorifics
  'mr',
  'mrs',
  'ms',
  'mx',
  'dr',
  'prof',
  'rev',
  'hon',
  'st',
  'sr',
  'jr',
  'gen',
  'col',
  'capt',
  'lt',
  'sgt',
  'gov',
  'sen',
  'rep',
  'pres',
  // Scholarly apparatus — the citation trick emits every one of these
  'cf',
  'ibid',
  'id',
  'op',
  'cit',
  'loc',
  'et',
  'al',
  'ed',
  'eds',
  'trans',
  'p',
  'pp',
  'vol',
  'vols',
  'no',
  'nos',
  'fig',
  'figs',
  'eq',
  'ch',
  'chap',
  'sec',
  'art',
  'para',
  'ff',
  'esp',
  'viz',
  // General prose abbreviations
  'etc',
  'vs',
  'approx',
  'ca',
  'circa',
  'dept',
  'univ',
  'inc',
  'ltd',
  'co',
  'corp',
  'est',
  'min',
  'max',
  'resp',
]);

// A trailing token made only of letters and interior periods, immediately
// before the segment-final period: "Fig." -> "Fig", "e.g." -> "e.g".
const TRAILING_TOKEN = /([\p{L}\p{M}\p{N}]+(?:\.[\p{L}\p{M}\p{N}]+)*)\.$/u;

// A dotted run of single letters is an initial ("T.", "W.W.", "H.Q."), never a
// sentence terminator. Cheaper and broader than enumerating every initial.
const INITIALISM = /^\p{L}(?:\.\p{L})*$/u;

function endsWithNonTerminalAbbreviation(sentence: string): boolean {
  const match = TRAILING_TOKEN.exec(sentence);
  const token = match?.[1];
  if (token === undefined) return false;
  return NON_TERMINAL_ABBREVIATIONS.has(token.toLowerCase()) || INITIALISM.test(token);
}

// Sentence-final punctuation, optionally followed by closing quotes/brackets.
const SENTENCE_FINAL = /[.!?…。！？]["'’”)\]»]*$/u;

/**
 * Split text into sentences. Segments are trimmed and empty ones dropped, so
 * callers can re-join with a single space without producing double-space
 * artefacts.
 */
export function splitOnSentenceBoundaries(input: string): string[] {
  const segments = [...SENTENCE_SEGMENTER.segment(input)].map((segment) => segment.segment);

  // Raw (untrimmed) accumulation so a merge preserves the exact interior
  // whitespace — a paragraph broken only by a newline must come back out with
  // its newline intact, not flattened to a space.
  const merged: string[] = [];
  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if (previous !== undefined && shouldMerge(previous.trim(), segment)) {
      merged[merged.length - 1] = previous + segment;
      continue;
    }
    merged.push(segment);
  }

  return merged.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0);
}

function shouldMerge(previous: string, next: string): boolean {
  if (previous.length === 0 || next.trim().length === 0) return true;
  // ICU also breaks on a bare line separator (SB4). Previously such text was
  // one chunk, and treating a soft line break as a sentence end would flatten
  // multi-line input, so a segment carrying no sentence-final punctuation is
  // rejoined with the one that follows it.
  if (!SENTENCE_FINAL.test(previous)) return true;
  return endsWithNonTerminalAbbreviation(previous);
}
