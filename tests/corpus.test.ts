import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Corpus, CorpusSentence, LanguageEntry } from '../src/corpus-types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const corpusPath = resolve(__dirname, '../data/corpus.json');

function isLanguageEntry(value: unknown): value is LanguageEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['code'] === 'string' &&
    typeof v['name'] === 'string' &&
    (v['family'] === 'natural' || v['family'] === 'register') &&
    typeof v['script'] === 'string' &&
    typeof v['notes'] === 'string'
  );
}

function isCorpusSentence(value: unknown): value is CorpusSentence {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v['id'] !== 'string') return false;
  if (typeof v['english'] !== 'string') return false;
  if (typeof v['translations'] !== 'object' || v['translations'] === null) return false;
  const translations = v['translations'] as Record<string, unknown>;
  return Object.values(translations).every((t) => typeof t === 'string');
}

function isCorpus(value: unknown): value is Corpus {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v['version'] !== '1') return false;
  if (typeof v['description'] !== 'string') return false;
  if (!Array.isArray(v['sentences'])) return false;
  if (!Array.isArray(v['languages'])) return false;
  return (
    (v['sentences'] as unknown[]).every(isCorpusSentence) &&
    (v['languages'] as unknown[]).every(isLanguageEntry)
  );
}

describe('corpus.json', () => {
  const raw: unknown = JSON.parse(readFileSync(corpusPath, 'utf-8'));

  it('validates against the Corpus schema', () => {
    expect(isCorpus(raw)).toBe(true);
  });

  it('has exactly 8 sentences', () => {
    expect(isCorpus(raw)).toBe(true);
    if (!isCorpus(raw)) return;
    expect(raw.sentences).toHaveLength(8);
  });

  it('has exactly 18 language entries', () => {
    expect(isCorpus(raw)).toBe(true);
    if (!isCorpus(raw)) return;
    expect(raw.languages).toHaveLength(18);
  });

  it('every sentence has exactly 18 translation keys', () => {
    expect(isCorpus(raw)).toBe(true);
    if (!isCorpus(raw)) return;
    const expectedCodes = raw.languages.map((l) => l.code).sort();
    for (const sentence of raw.sentences) {
      const keys = Object.keys(sentence.translations).sort();
      expect(keys).toEqual(expectedCodes);
    }
  });

  it('sentence ids are sequential s01–s08', () => {
    expect(isCorpus(raw)).toBe(true);
    if (!isCorpus(raw)) return;
    const ids = raw.sentences.map((s) => s.id);
    expect(ids).toEqual(['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08']);
  });

  it('description contains caveats text', () => {
    expect(isCorpus(raw)).toBe(true);
    if (!isCorpus(raw)) return;
    expect(raw.description.toLowerCase()).toContain('caveat');
  });
});
