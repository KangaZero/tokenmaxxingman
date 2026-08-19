// SATIRE NOTICE: All citations in this module are entirely fabricated and deliberately absurd.
// Author names, journal titles, years, and page ranges are invented for comic effect.
// They are designed to be unmistakably ridiculous — not realistic enough to be mistaken
// for real scholarship. This module exists to inflate token count via fake academic theatre.

import { splitOnSentenceBoundaries } from '../utils/text.js';

const FAKE_CITATIONS: readonly string[] = [
  '(see Blobsworth & Quackenheimer, 1887, pp. 3–3, "Journal of Unnecessary Verbosity Studies")',
  '(cf. Flibbertigibbet & Wobblejaw, 2099, pp. 1,492–1,501, "Annals of Profoundly Obvious Research")',
  '(per Mumpsimusson, Dinglebottom & Associates, 1066, pp. 42–42, "Proceedings of the Society for Circular Reasoning")',
  '(see van der Waffle & Nonsensborough, 3001, pp. 0–∞, "Transactions on Abstract Nothingness, Vol. −1")',
  '(cf. Sploosh, T. & Kersplunk, W.W., 2025, pp. 9,999–10,000, "The Bi-Monthly Quarterly of Tautological Assertions")',
  '(attributed to Pretzelbauer & Biscuitsmith, 1492, pp. 88–87, "Retrograde Journal of Reverse Pagination")',
  '(contra Snorkelson et al., 1899, pp. 404–404, "European Review of Things Already Said Elsewhere")',
  '(following Wigglespoon & Doodlefritz, 2112, pp. 7–6, "International Compendium of Moot Points, 4th Imaginary Edition")',
  '(see Blunderbuss & Kerfuffle, 1776, pp. −12–−5, "Journal of Negative Page Numbers and Associated Paradoxes")',
  '(cf. Grumblethwaite, Mumblechin & Floppington, 9999, p. ?, "Speculative Treatise on Unknowable Things, Appendix Z")',
  '(per Clambottom & Snickersnee, 2000, pp. 1–9,999,999, "The All-Inclusive Everything Studies Omnibus")',
  '(see McFumbleton & O\'Bloviate, 1843, pp. 13–13, "Monograph on the Singular Conclusion Reached Once")',
  '(cf. Drizzlepants, H.Q. & Wumbleford, A.B.C., 2077, pp. NaN–NaN, "The Journal of Undefined Empirical Results")',
  '(contra Splotchwick III & Dame Fudgery-Waffle, 1234, pp. 5678–9012, "Proceedings: Conference on Conferences About Conferences")',
  '(following Blathersworth, Twaddle & Piffle, 2042, p. π, "Irrational Numbers Monthly: Academic Edition")',
  '(see Flumoxington & Spurrgle, 1901, pp. 100–99, "The Descending Page Review, Vol. XLVII")',
  '(per Bombasticus Magnus & Verbosio del Longwinde, 1610, pp. lxiv–xcii, "Summa Vacua: On the Fullness of Empty Arguments")',
  '(cf. Dr. Incomprehensible & Prof. Unpublishable, 1987, pp. tbd–tbd, "Working Paper Never Submitted to Anywhere")',
  '(attributed to Wafflington-Smythe, Q.Q.Q. & Tweedledum, T., 2525, pp. α–ω, "Post-Temporal Studies in Anachronistic Citation Practices")',
  '(see the collected works of Blunderpuss & Squibblethong, all years simultaneously, all pages, "The Complete Omnibus of Unnecessary Academic Apparatus")',
];

export function citation(input: string): string {
  if (input.trim().length === 0) return input;

  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return input;

  const result: string[] = [];
  // Pool selection is driven by its own counter, incremented once per citation
  // actually emitted, and is deliberately independent of the "does this sentence
  // get a citation?" test. Selecting with `index % FAKE_CITATIONS.length` while
  // only odd `index` values passed that test meant odd pool slots were the only
  // reachable ones: 10 of the 20 citations were dead code. A dedicated counter
  // walks the whole pool and stays deterministic — it is a pure function of the
  // sentence order.
  let citationIndex = 0;

  for (const [index, sentence] of sentences.entries()) {
    // Insert citation after every 2nd sentence (even-indexed after the first).
    if (index % 2 !== 1) {
      result.push(sentence);
      continue;
    }

    const cite = FAKE_CITATIONS[citationIndex % FAKE_CITATIONS.length];
    citationIndex++;
    if (cite === undefined) {
      result.push(sentence);
      continue;
    }

    // Append before the trailing punctuation so the citation reads as mid-sentence apparatus.
    const trailingPunct = /[.!?]$/.test(sentence) ? sentence.slice(-1) : '';
    const body = trailingPunct.length > 0 ? sentence.slice(0, -1) : sentence;
    result.push(`${body} ${cite}${trailingPunct}`);
  }

  return result.join(' ');
}
