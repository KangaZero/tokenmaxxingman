import { encode as encodeCl100k } from 'gpt-tokenizer/encoding/cl100k_base';
import { encode as encodeO200k } from 'gpt-tokenizer/encoding/o200k_base';

export type EncodingName = 'cl100k_base' | 'o200k_base';

export interface TokenCount {
  tokens: number;
  characters: number;
  bytes: number;
  words: number;
  encoding: EncodingName;
}

const encoders: Record<EncodingName, (text: string) => number[]> = {
  cl100k_base: encodeCl100k,
  o200k_base: encodeO200k,
};

function makeSegmenter(locale?: string): Intl.Segmenter {
  try {
    return new Intl.Segmenter(locale, { granularity: 'word' });
  } catch {
    return new Intl.Segmenter(undefined, { granularity: 'word' });
  }
}

export function countTokens(text: string, encoding: EncodingName, locale?: string): TokenCount {
  const encode = encoders[encoding];
  const words = [...makeSegmenter(locale).segment(text)].filter((s) => s.isWordLike).length;
  return {
    tokens: encode(text).length,
    characters: [...text].length,
    bytes: new TextEncoder().encode(text).length,
    words,
    encoding,
  };
}
