// Rhetorical-question interjection. Pepper sentences with mid-clause
// hedged questions that contribute structurally-correct prose while
// adding 30-60 tokens per insertion. Deterministic position selection
// (sentence index modulo pool length) — same input always yields the
// same interjections at the same positions.

import { splitOnSentenceBoundaries } from '../utils/text.js';

const INTERJECTIONS: readonly string[] = [
  '— but is that not, when one really stops to consider it carefully, the most fundamental observation one could hope to articulate on a matter of this kind? —',
  '— and what, in the final and most considered analysis available to us, could be more emblematic of the substantive matter immediately at hand? —',
  '— for who among us, given even the most cursory honest reflection on the subject, would presume to deny the considerable import of this particular consideration? —',
  '— though one might reasonably ask, with perfect propriety and indeed with the full force of academic convention, whether the converse proposition does not hold with very nearly equal demonstrative force? —',
  '— and yet, can we be entirely certain — entirely, that is, in the strongest available epistemic sense of the term — that the surface appearance of the matter fully captures the underlying substance? —',
  '— is it not the case, dear reader, that any candid assessment must concede this point even before the argument has been formally adumbrated? —',
  '— and what, after all, is a sentence of this sort if not an opportunity to dwell, however briefly, on the conceptual richness of the very predicate now under examination? —',
];

// Insert at roughly the midpoint of each even-indexed sentence (0, 2, 4, ...).
// Odd-indexed sentences are left untouched so the cadence is not entirely
// monotonous — alternating injected-and-not is closer to convincing prose.
const TARGET_RATIO = 0.5;

export function rhetoricalQuestions(input: string): string {
  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return input;

  const out: string[] = sentences.map((sentence, i) => {
    if (i % 2 !== 0) return sentence;

    const interjection = INTERJECTIONS[i % INTERJECTIONS.length];
    if (interjection === undefined) return sentence;

    const words = sentence.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 4) return sentence;

    const mid = Math.max(1, Math.floor(words.length * TARGET_RATIO));
    const before = words.slice(0, mid).join(' ');
    const after = words.slice(mid).join(' ');
    return `${before} ${interjection} ${after}`;
  });

  return out.join(' ');
}
