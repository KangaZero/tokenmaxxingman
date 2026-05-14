export type LangCode = string;
export type SentenceId = string;

export interface CorpusSentence {
  id: SentenceId;
  english: string;
  translations: Record<LangCode, string>;
}

export interface LanguageEntry {
  code: LangCode;
  name: string;
  family: 'natural' | 'register';
  script: string;
  notes: string;
}

export interface Corpus {
  version: '1';
  description: string;
  sentences: CorpusSentence[];
  languages: LanguageEntry[];
}
