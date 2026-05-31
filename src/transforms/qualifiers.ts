import { splitOnSentenceBoundaries } from '../utils/text.js';

const HEDGES: readonly string[] = [
  'It is, of course, important to note that',
  'Notwithstanding the foregoing,',
  'As any reasonable person would readily acknowledge,',
  'In a manner that is, in many respects, not entirely dissimilar to the general principle,',
  'One must acknowledge, with due consideration, that',
  'It bears mentioning, for the sake of complete transparency, that',
  'Subject to the caveats and qualifications enumerated herein,',
  'Without prejudice to any other interpretation that may reasonably be advanced,',
  'In light of the prevailing circumstances as understood at this juncture,',
  'For all intents and purposes, and with full awareness of the attendant complexity,',
  'It would be remiss not to observe, in this particular context, that',
  'Bearing in mind the multifaceted nature of the situation,',
  'With appropriate deference to alternative viewpoints,',
  'To the extent that such matters are within the scope of this discourse,',
  'Mindful of the inherent limitations of any such generalisation,',
];

const SUFFIXES: readonly string[] = [
  ', as the case may be',
  ', all things considered',
  ', for what it is worth',
  ', broadly speaking',
  ', subject to revision upon receipt of further information',
];

export function qualifiers(input: string): string {
  const sentences = splitOnSentenceBoundaries(input);

  const qualified = sentences.map((sentence, index) => {
    // Deterministically select hedge by index modulo pool length — even-indexed sentences get a prefix.
    if (index % 2 === 0) {
      const hedge = HEDGES[index % HEDGES.length];
      if (hedge === undefined) return sentence;
      const lower = sentence.charAt(0).toLowerCase() + sentence.slice(1);
      const suffix = SUFFIXES[index % SUFFIXES.length];
      if (suffix === undefined) return `${hedge} ${lower}`;
      // Strip trailing punctuation temporarily to append suffix cleanly.
      const trailingPunct = /[.!?]$/.test(lower) ? lower.slice(-1) : '';
      const body = trailingPunct.length > 0 ? lower.slice(0, -1) : lower;
      return `${hedge} ${body}${suffix}${trailingPunct}`;
    }
    return sentence;
  });

  return qualified.join(' ');
}
