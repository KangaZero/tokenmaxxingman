import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translate } from './transforms/translate.js';
import { codeSwitching } from './transforms/code-switching.js';
import { reduplication } from './tricks/reduplication.js';
import { rhetoricalQuestions } from './tricks/rhetorical-questions.js';

export type ExpandMode =
  | 'verbose-lite'
  | 'verbose-full'
  | 'verbose-ultra'
  | 'verbose-galactic'
  | 'translate-burmese'
  | 'translate-tibetan'
  | 'translate-inuktitut'
  | 'anti-wenyan';

type Transform = (input: string) => string;

function pipe(...transforms: readonly Transform[]): Transform {
  return (input: string) => transforms.reduce((acc, transform) => transform(acc), input);
}

const VERBOSE_LITE: Transform = pipe(synonyms);
const VERBOSE_FULL: Transform = pipe(synonyms, qualifiers);
const VERBOSE_ULTRA: Transform = pipe(synonyms, qualifiers, nominalizations, passive);

// `verbose-galactic` chains every English-side amplifier: synonym swap,
// Latin/French code-switching, qualifier injection, nominalization,
// reduplication, mid-sentence rhetorical interjection, and finally passive
// voice. The most extreme English mode short of running through translate.
const VERBOSE_GALACTIC: Transform = pipe(
  synonyms,
  codeSwitching,
  qualifiers,
  nominalizations,
  reduplication,
  rhetoricalQuestions,
  passive,
);

// `anti-wenyan` resolves to Inuktitut Syllabics (iu-cans), the natural-language
// winner of the bundled benchmark under both cl100k_base (21.05 tok/word) and
// o200k_base (21.55 tok/word) — the empirical opposite of Classical Chinese
// (~2.93 / ~1.97 tok/word). Reproduce with `tmm benchmark`.
const ANTI_WENYAN_LANG = 'iu-cans';

// `translate-inuktitut` and `anti-wenyan` are two names for the same pipeline
// (Inuktitut is the benchmark winner). Share one Transform so they can never drift.
const ANTI_WENYAN: Transform = pipe(VERBOSE_ULTRA, (input) => translate(input, ANTI_WENYAN_LANG));

const PIPELINES: ReadonlyMap<ExpandMode, Transform> = new Map([
  ['verbose-lite', VERBOSE_LITE],
  ['verbose-full', VERBOSE_FULL],
  ['verbose-ultra', VERBOSE_ULTRA],
  ['verbose-galactic', VERBOSE_GALACTIC],
  ['translate-burmese', pipe(VERBOSE_ULTRA, (input) => translate(input, 'my'))],
  ['translate-tibetan', pipe(VERBOSE_ULTRA, (input) => translate(input, 'bo'))],
  ['translate-inuktitut', ANTI_WENYAN],
  ['anti-wenyan', ANTI_WENYAN],
]);

export function expand(input: string, mode: ExpandMode): string {
  const pipeline = PIPELINES.get(mode);
  if (pipeline === undefined) {
    // This branch is unreachable given the ExpandMode union, but serves as a runtime guard.
    return input;
  }
  return pipeline(input);
}
