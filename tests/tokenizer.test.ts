import { describe, it, expect } from 'vitest';
import { countTokens } from '../src/tokenizer.js';

describe('countTokens', () => {
  it('returns correct shape for cl100k_base', () => {
    const result = countTokens('hello world', 'cl100k_base');
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.characters).toBe(11);
    expect(result.bytes).toBe(11);
    expect(result.encoding).toBe('cl100k_base');
  });

  it('returns correct shape for o200k_base', () => {
    const result = countTokens('hello world', 'o200k_base');
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.characters).toBe(11);
    expect(result.bytes).toBe(11);
    expect(result.encoding).toBe('o200k_base');
  });

  it('cl100k_base tokenises "hello world" into 2 tokens', () => {
    // "hello" → 15339, " world" → 1917 in cl100k_base
    expect(countTokens('hello world', 'cl100k_base').tokens).toBe(2);
  });

  it('o200k_base tokenises "hello world" into 2 tokens', () => {
    // "hello" → 24912, " world" → 2375 in o200k_base
    expect(countTokens('hello world', 'o200k_base').tokens).toBe(2);
  });

  it('empty string returns 0 tokens for cl100k_base', () => {
    expect(countTokens('', 'cl100k_base').tokens).toBe(0);
  });

  it('empty string returns 0 tokens for o200k_base', () => {
    expect(countTokens('', 'o200k_base').tokens).toBe(0);
  });

  it('empty string returns 0 characters and 0 bytes', () => {
    const result = countTokens('', 'cl100k_base');
    expect(result.characters).toBe(0);
    expect(result.bytes).toBe(0);
  });

  it('multibyte characters: bytes > characters', () => {
    // "世界" = 2 Unicode code points, 6 UTF-8 bytes
    const result = countTokens('世界', 'cl100k_base');
    expect(result.characters).toBe(2);
    expect(result.bytes).toBe(6);
  });
});
