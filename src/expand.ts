import { synonyms } from './transforms/synonyms.js';
import { qualifiers } from './transforms/qualifiers.js';
import { nominalizations } from './transforms/nominalizations.js';
import { passive } from './transforms/passive.js';
import { translateSentences } from './transforms/translate.js';
import type { LangCode } from './transforms/translate.js';
import { codeSwitching } from './transforms/code-switching.js';
import { reduplication } from './tricks/reduplication.js';
import { rhetoricalQuestions } from './tricks/rhetorical-questions.js';

/**
 * Every expand mode, in documentation order. Single source of truth: the CLI,
 * the MCP server, and the docs all enumerate from this array so a new mode can
 * never be added in one place and forgotten in another.
 *
 * `anti-wenyan` is a deprecated alias for `maxlang`, retained for the 0.0.x
 * published API. Slated for removal in 1.0.
 */
export const EXPAND_MODES = [
  'verbose-lite',
  'verbose-full',
  'verbose-ultra',
  'verbose-galactic',
  'translate-burmese',
  'translate-tibetan',
  'translate-inuktitut',
  'maxlang',
  'anti-wenyan',
] as const;

export type ExpandMode = (typeof EXPAND_MODES)[number];

/** Modes that are still supported but no longer the canonical spelling. */
export const DEPRECATED_EXPAND_MODES: Readonly<Record<string, ExpandMode>> = {
  'anti-wenyan': 'maxlang',
};

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

// `maxlang` resolves to whichever natural language the bundled benchmark elects
// as highest tokens-per-character. Currently Inuktitut Syllabics (iu-cans),
// rank 1 under both cl100k_base (21.05 tok/word) and o200k_base (21.55 tok/word),
// against a Classical Chinese density baseline of ~2.93 / ~1.97 tok/word.
// Reproduce with `tmm benchmark`.
const MAXLANG_LANG = 'iu-cans';

/**
 * Translate-then-amplify. The phrasebook is keyed by plain source sentences, so
 * the lookup only has a chance of hitting BEFORE the English amplifiers rewrite
 * the text — running `translate` last (as this module did until 0.1.0) made
 * every translate mode structurally incapable of emitting a single non-Latin
 * character. Sentences the phrasebook does not know are left in English and
 * amplified as usual; nothing is ever marked up as untranslatable.
 */
function translateThenAmplify(target: LangCode): Transform {
  return pipe((input) => translateSentences(input, target), VERBOSE_ULTRA);
}

// `translate-inuktitut`, `maxlang`, and the deprecated `anti-wenyan` are three
// names for one pipeline (Inuktitut is the current benchmark winner). They share
// a single Transform so the aliases can never drift apart.
const MAXLANG: Transform = translateThenAmplify(MAXLANG_LANG);

const PIPELINES: ReadonlyMap<ExpandMode, Transform> = new Map([
  ['verbose-lite', VERBOSE_LITE],
  ['verbose-full', VERBOSE_FULL],
  ['verbose-ultra', VERBOSE_ULTRA],
  ['verbose-galactic', VERBOSE_GALACTIC],
  ['translate-burmese', translateThenAmplify('my')],
  ['translate-tibetan', translateThenAmplify('bo')],
  ['translate-inuktitut', MAXLANG],
  ['maxlang', MAXLANG],
  // Deprecated alias — same Transform instance, so behaviour is identical.
  ['anti-wenyan', MAXLANG],
]);

export function expand(input: string, mode: ExpandMode): string {
  const pipeline = PIPELINES.get(mode);
  if (pipeline === undefined) {
    // This branch is unreachable given the ExpandMode union, but serves as a runtime guard.
    return input;
  }
  return pipeline(input);
}
