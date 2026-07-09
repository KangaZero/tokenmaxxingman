import type { Corpus, LangCode } from './corpus-types.js';
import type { EncodingName } from './tokenizer.js';
import { countTokens } from './tokenizer.js';

export interface BenchmarkRow {
  code: LangCode;
  name: string;
  family: 'natural' | 'register';
  script: string;
  totalTokens: number;
  totalCharacters: number;
  totalBytes: number;
  sentenceCount: number;
  tokensPerCharacter: number;
  tokensPerSentence: number;
  rank: number;
}

export interface BenchmarkResult {
  encoding: EncodingName;
  corpusVersion: string;
  rows: BenchmarkRow[];
}

export function runBenchmark(corpus: Corpus, encoding: EncodingName): BenchmarkResult {
  const unranked: Array<Omit<BenchmarkRow, 'rank'>> = corpus.languages.map((lang) => {
    let totalTokens = 0;
    let totalCharacters = 0;
    let totalBytes = 0;
    let sentenceCount = 0;

    for (const sentence of corpus.sentences) {
      const text = sentence.translations[lang.code];
      if (text === undefined) continue;
      sentenceCount += 1;
      const counted = countTokens(text, encoding);
      totalTokens += counted.tokens;
      totalCharacters += counted.characters;
      totalBytes += counted.bytes;
    }
    const tokensPerCharacter = totalCharacters === 0 ? 0 : totalTokens / totalCharacters;
    const tokensPerSentence = sentenceCount === 0 ? 0 : totalTokens / sentenceCount;

    return {
      code: lang.code,
      name: lang.name,
      family: lang.family,
      script: lang.script,
      totalTokens,
      totalCharacters,
      totalBytes,
      sentenceCount,
      tokensPerCharacter,
      tokensPerSentence,
    };
  });

  const sorted = [...unranked].sort((a, b) => {
    if (b.tokensPerCharacter !== a.tokensPerCharacter) {
      return b.tokensPerCharacter - a.tokensPerCharacter;
    }
    if (b.tokensPerSentence !== a.tokensPerSentence) {
      return b.tokensPerSentence - a.tokensPerSentence;
    }
    return a.code.localeCompare(b.code);
  });

  const rows: BenchmarkRow[] = sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  return {
    encoding,
    corpusVersion: corpus.version,
    rows,
  };
}
