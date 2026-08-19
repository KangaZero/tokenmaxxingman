// Reduplication trick — word doubling for emphasis. The pattern is
// attested across Tok Pisin, Indonesian, Mandarin, and many Austronesian
// grammars as a real morphological intensifier. Here we hijack it as a
// deterministic token-inflation primitive: every adjective and intensifier
// from a static lookup gets a hyphenated copy of itself, sometimes
// expanded into a full triplet for additional weight.
//
// Reduplication is applied BEFORE the passive transform so the doubled
// forms survive the SVO rewrite (which only triggers on bare verbs).

import { applyCase, wholeWordPattern } from '../utils/text.js';

const REDUPLICATED: ReadonlyMap<string, string> = new Map([
  ['big', 'big-big-big'],
  ['small', 'small-small-small'],
  ['fast', 'fast-fast'],
  ['slow', 'slow-slow'],
  ['hot', 'hot-hot-very-hot'],
  ['cold', 'cold-cold-extremely-cold'],
  ['old', 'old-and-old-and-also-old'],
  ['new', 'new-new-newest-of-the-new'],
  ['good', 'good-and-good-and-then-also-additionally-good'],
  ['bad', 'bad-and-bad-and-altogether-bad'],
  ['hard', 'hard-hard-rather-uncommonly-hard'],
  ['easy', 'easy-easy-positively-effortlessly-easy'],
  ['long', 'long-and-long-and-protractedly-long'],
  ['short', 'short-short-brevity-itself-short'],
  ['real', 'really-truly-genuinely-and-unimpeachably-real'],
  ['true', 'true-as-true-can-conceivably-be-and-then-some'],
  ['very', 'very-very-very-very'],
  ['great', 'great-and-also-great-and-truly-magnificently-great'],
  ['nice', 'nice-and-quite-nice-and-also-tolerably-nice'],
  ['simple', 'simple-and-uncomplicatedly-simple'],
  ['complex', 'complex-and-multifariously-complex'],
  ['important', 'important-and-truly-of-paramount-importance'],
  ['interesting', 'interesting-and-not-to-put-too-fine-a-point-on-it-fascinating'],
  ['obvious', 'obvious-and-self-evidently-obvious'],
  ['clear', 'clear-and-crystalline-and-unambiguously-clear'],
]);

// Unicode-aware boundaries — see utils/text.ts for why `\b` is unusable on the
// Burmese / Tibetan / Syllabics text this project deliberately handles.
const REDUPLICATION_PATTERNS: ReadonlyMap<RegExp, string> = new Map(
  [...REDUPLICATED].map(([word, doubled]) => [wholeWordPattern([word]), doubled]),
);

export function reduplication(input: string): string {
  let result = input;
  for (const [pattern, doubled] of REDUPLICATION_PATTERNS) {
    result = result.replace(pattern, (match) => applyCase(match, doubled));
  }
  return result;
}
