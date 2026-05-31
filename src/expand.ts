import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translate } from './transforms/translate.js';

export type ExpandMode =
  | 'verbose-lite'
  | 'verbose-full'
  | 'verbose-ultra'
  | 'translate-burmese'
  | 'translate-tibetan'
  | 'translate-inuktitut'
  | 'anti-wenyan';

type Transform = (input: string) => string;

function pipe(...transforms: readonly Transform[]): Transform {
  return (input: string) =>
    transforms.reduce((acc, transform) => transform(acc), input);
}

const VERBOSE_LITE: Transform = pipe(synonyms);
const VERBOSE_FULL: Transform = pipe(synonyms, qualifiers);
const VERBOSE_ULTRA: Transform = pipe(synonyms, qualifiers, nominalizations, passive);

// `anti-wenyan` resolves to Inuktitut Syllabics (iu-cans), the natural-language
// winner of the bundled benchmark under both cl100k_base (2.62 tok/char) and
// o200k_base (2.68 tok/char) — the empirical opposite of Classical Chinese
// (~1.5 / ~1.0 tok/char). Reproduce with `tmm benchmark`.
const ANTI_WENYAN_LANG = 'iu-cans';

const PIPELINES: ReadonlyMap<ExpandMode, Transform> = new Map([
  ['verbose-lite', VERBOSE_LITE],
  ['verbose-full', VERBOSE_FULL],
  ['verbose-ultra', VERBOSE_ULTRA],
  [
    'translate-burmese',
    pipe(VERBOSE_ULTRA, (input) => translate(input, 'my')),
  ],
  [
    'translate-tibetan',
    pipe(VERBOSE_ULTRA, (input) => translate(input, 'bo')),
  ],
  [
    'translate-inuktitut',
    pipe(VERBOSE_ULTRA, (input) => translate(input, ANTI_WENYAN_LANG)),
  ],
  [
    'anti-wenyan',
    pipe(VERBOSE_ULTRA, (input) => translate(input, ANTI_WENYAN_LANG)),
  ],
]);

export function expand(input: string, mode: ExpandMode): string {
  const pipeline = PIPELINES.get(mode);
  if (pipeline === undefined) {
    // This branch is unreachable given the ExpandMode union, but serves as a runtime guard.
    return input;
  }
  return pipeline(input);
}
