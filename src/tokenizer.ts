import { encode as encodeCl100k } from 'gpt-tokenizer/encoding/cl100k_base';
import { encode as encodeO200k } from 'gpt-tokenizer/encoding/o200k_base';

export type EncodingName = 'cl100k_base' | 'o200k_base';

export interface TokenCount {
  tokens: number;
  characters: number;
  bytes: number;
  encoding: EncodingName;
}

const encoders: Record<EncodingName, (text: string) => number[]> = {
  cl100k_base: encodeCl100k,
  o200k_base: encodeO200k,
};

export function countTokens(text: string, encoding: EncodingName): TokenCount {
  const encode = encoders[encoding];
  return {
    tokens: encode(text).length,
    characters: [...text].length,
    bytes: new TextEncoder().encode(text).length,
    encoding,
  };
}
