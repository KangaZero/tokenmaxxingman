import { splitOnSentenceBoundaries } from '../utils/text.js';

export interface PaddingOptions {
  targetMultiplier: number;
}

const PADDING_PHRASES: readonly string[] = [
  'Furthermore, and this cannot be overstated,',
  'In light of the foregoing considerations,',
  'It bears further mention, however briefly,',
  'Without belabouring a point that is, in many respects, self-evident,',
  'A passing observation that, while not strictly germane, nevertheless deserves brief recognition:',
  'If one were inclined to indulge in a moment of digression — and one is, in fact, so inclined —',
  'The careful reader will already have anticipated what follows, but it merits enumeration nonetheless:',
  'As is widely (though not, perhaps, universally) acknowledged,',
  'It would be an oversight of considerable proportions to omit mention of the fact that',
  'For the purposes of providing the fullest possible account of the matter at hand,',
  'Lest the point be lost amid the broader discussion, it is worth reiterating that',
  'To situate this observation within the appropriate conceptual framework,',
  'In a spirit of thoroughness that the subject demands,',
  'One cannot help but observe, with the benefit of hindsight and careful reflection, that',
  'Not to put too fine a point on the matter, but it is nonetheless worth stating plainly that',
  'Setting aside, for the moment, the more contentious aspects of this question,',
  'Even the most cursory examination of the evidence would reveal, to any dispassionate observer, that',
  'With the appropriate level of epistemic humility that such matters require,',
  'Digressing only briefly from the principal thrust of the argument,',
  'In the interest of leaving no ambiguity whatsoever on this particular point,',
  'It would be intellectually dishonest to proceed without first acknowledging that',
  'By way of a parenthetical note that is, admittedly, somewhat tangential to the main thread,',
  'As a supplementary observation that may or may not illuminate the foregoing,',
  'Returning, momentarily, to a point touched upon earlier but not yet fully exhausted,',
  'For the avoidance of any doubt that might otherwise arise in the mind of the reader,',
  'To round out the picture with a degree of completeness that the subject warrants,',
  'In the grand scheme of things, and with due recognition of the broader context,',
  'It would be remiss to leave unaddressed the not entirely trivial consideration that',
  'One is compelled, by the weight of intellectual honesty, to concede that',
  'While it may seem unnecessary to belabour a point that is, on its face, rather obvious,',
  'Notwithstanding the considerable ground already covered, it remains to be observed that',
  'For what it is worth — and the present author believes it is worth a considerable amount —',
];

// A guard has to be independent of the thing it guards against. The previous
// bound was `PADDING_PHRASES.length * multiplier`, which grows with the very
// input that makes the loop dangerous: `targetMultiplier: 100_000` on 4.4 KB of
// text produced 419.6 MB in ~4 s. Two constants replace it.
//
// One full cycle through the phrase bank. Past that the appended sentences
// repeat verbatim, so further iterations buy length without buying variety —
// which is the only reason to append at all.
const MAX_APPENDED_ELABORATIONS = PADDING_PHRASES.length;

// Absolute ceiling on what a single call may return, regardless of multiplier.
// 1 MiB matches MEMORY_BUDGET_BYTES in maxxer.ts, the point at which the
// pipeline already stops growing output, so padding cannot be the component
// that blows a budget every other stage respects. This is enforced inside the
// function rather than at the CLI so the exported API, the MCP server, and the
// library are all safe without a caller-side clamp.
const MAX_OUTPUT_CHARACTERS = 1_048_576;

export function padding(input: string, opts?: Partial<PaddingOptions>): string {
  const multiplier = opts?.targetMultiplier ?? 3;
  if (input.trim().length === 0) return input;

  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return input;

  const targetLength = Math.min(input.length * multiplier, MAX_OUTPUT_CHARACTERS);
  const result: string[] = [];
  let phraseIndex = 0;
  // Running total of the joined length, so the ceiling is enforced while the
  // sentences are being assembled rather than after the fact — a truncating
  // check would have to cut mid-word.
  let length = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if (sentence === undefined) continue;

    if (i > 0 && length < MAX_OUTPUT_CHARACTERS) {
      const phrase = PADDING_PHRASES[phraseIndex % PADDING_PHRASES.length];
      if (phrase !== undefined) {
        const lowered = sentence.charAt(0).toLowerCase() + sentence.slice(1);
        const padded = `${phrase} ${lowered}`;
        result.push(padded);
        length += padded.length + 1;
        phraseIndex++;
        continue;
      }
    }
    result.push(sentence);
    length += sentence.length + 1;
  }

  let output = result.join(' ');

  // If still under target, keep appending phrases as standalone elaboration
  // sentences. Both bounds are constants, so the worst case here is a fixed
  // number of appends of fixed-length strings no matter what the caller asks for.
  for (let extra = 0; extra < MAX_APPENDED_ELABORATIONS; extra++) {
    if (output.length >= targetLength) break;
    const phrase = PADDING_PHRASES[(phraseIndex + extra) % PADDING_PHRASES.length];
    if (phrase === undefined) break;
    // Append as a standalone parenthetical sentence that extends the last thought.
    output += ` ${phrase} the substance of the preceding statement warrants serious attention.`;
  }

  return output;
}
