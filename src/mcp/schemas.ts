import { z } from 'zod';
import { EXPAND_MODES } from '../expand.js';
import { targets as LANG_CODES } from '../transforms/translate.js';

export const ENCODING_NAMES = ['cl100k_base', 'o200k_base'] as const;
export const TIME_TIERS = ['sprint-1m', 'sprint-5m', 'sprint-10m', 'sprint-1h'] as const;

/**
 * Inputs are capped so a client cannot make the server allocate unboundedly.
 * `maxx_text` can inflate its input by two orders of magnitude, so the ceiling
 * is deliberately well below anything that would exhaust the heap.
 */
export const MAX_INPUT_CHARS = 100_000;

/**
 * Worst-case response size the server is willing to produce, in characters.
 * `maxx_text` output is emitted twice per response (once as text content, once
 * in `structuredContent`), so the JSON frame is roughly double this.
 */
export const MAX_OUTPUT_CHARS = 1_000_000;

export const textInput = z
  .string()
  .min(1, 'text must not be empty')
  // `.max()` is expressible in JSON Schema, so the client can reject early —
  // but it counts UTF-16 code units. One code point is at most two units, so
  // this is a correct (if loose) outer bound; `refine` below enforces the real
  // limit in the same unit `count_tokens` reports.
  .max(MAX_INPUT_CHARS * 2)
  .refine(
    (value) => [...value].length <= MAX_INPUT_CHARS,
    `text must be at most ${MAX_INPUT_CHARS} characters (Unicode code points)`,
  )
  .describe('The source text to measure or inflate. Plain prose; never source code.');

export const encodingInput = z
  .enum(ENCODING_NAMES)
  .default('cl100k_base')
  .describe(
    'Byte-pair-encoding vocabulary to count against. `cl100k_base` (GPT-4 era) or `o200k_base` (GPT-4o era). Defaults to cl100k_base.',
  );

export const modeInput = z
  .enum(EXPAND_MODES)
  .describe(
    'Expansion pipeline. `verbose-*` are English-only amplifiers in ascending severity; `translate-*` append a phrasebook translation pass; `maxlang` resolves to the benchmark-winning language (currently Inuktitut Syllabics). `anti-wenyan` is a deprecated alias for `maxlang`.',
  );

export const langCodeInput = z
  .enum(LANG_CODES as readonly [string, ...string[]])
  .describe('Final translation pass language code.');

export const localeInput = z
  .string()
  .min(2)
  .max(35)
  .optional()
  .describe(
    'BCP-47 locale used for word segmentation, e.g. `iu-Cans`. Affects the word count and tokens-per-word only, never the token count.',
  );

/** Reusable output shape for a measured text. Mirrors `Measurement`. */
export const measurementShape = {
  tokens: z.number().int().describe('Token count under the selected encoding.'),
  characters: z.number().int().describe('Unicode code-point count.'),
  bytes: z.number().int().describe('UTF-8 byte length.'),
  words: z.number().int().describe('Word-like segments per Intl.Segmenter.'),
  tokensPerCharacter: z.number(),
  tokensPerWord: z.number(),
} as const;

export const inflationShape = {
  tokenRatio: z.number().describe('after.tokens / before.tokens.'),
  characterRatio: z.number().describe('after.characters / before.characters.'),
  tokensAdded: z.number().int().describe('Absolute token delta.'),
} as const;
