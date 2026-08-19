import type { EncodingName } from '../tokenizer.js';
import { countTokens } from '../tokenizer.js';

/** A single text measurement, in the shape the MCP tools return it. */
export interface Measurement {
  tokens: number;
  characters: number;
  bytes: number;
  words: number;
  tokensPerCharacter: number;
  tokensPerWord: number;
}

/** Guard against `0/0` producing `NaN`, which is not valid JSON. */
function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function measure(text: string, encoding: EncodingName, locale?: string): Measurement {
  const counted = countTokens(text, encoding, locale);
  return {
    tokens: counted.tokens,
    characters: counted.characters,
    bytes: counted.bytes,
    words: counted.words,
    tokensPerCharacter: ratio(counted.tokens, counted.characters),
    tokensPerWord: ratio(counted.tokens, counted.words),
  };
}

export interface Inflation {
  tokenRatio: number;
  characterRatio: number;
  tokensAdded: number;
}

export function inflation(before: Measurement, after: Measurement): Inflation {
  return {
    tokenRatio: ratio(after.tokens, before.tokens),
    characterRatio: ratio(after.characters, before.characters),
    tokensAdded: after.tokens - before.tokens,
  };
}
