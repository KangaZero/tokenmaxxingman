import { describe, it, expect } from 'vitest';
import { expand } from '../src/expand.js';
import type { ExpandMode } from '../src/expand.js';

describe('expand pipeline routing', () => {
  const input = 'Use this to help.';

  it('verbose-lite applies synonyms only — output contains "Utilize"', () => {
    const result = expand(input, 'verbose-lite');
    // "Use" → "Utilize" (capitalised because the source word is sentence-initial)
    expect(result).toContain('Utilize');
  });

  it('verbose-full output is longer than input', () => {
    expect(expand(input, 'verbose-full').length).toBeGreaterThan(input.length);
  });

  it('verbose-ultra output is at least 2× the length of input', () => {
    const longInput = 'Use this to help. Start the process and decide on the next steps. Consider what to do.';
    const result = expand(longInput, 'verbose-ultra');
    expect(result.length).toBeGreaterThanOrEqual(longInput.length * 2);
  });

  it('translate-burmese produces non-English output or fallback prefix for unknown input', () => {
    const result = expand(input, 'translate-burmese');
    // After verbose-ultra the expanded form will not be in the phrasebook,
    // so we expect the fallback prefix.
    expect(result).toContain('[no translation available: my]');
  });

  it('translate-tibetan produces the fallback prefix for an expanded input', () => {
    const result = expand(input, 'translate-tibetan');
    expect(result).toContain('[no translation available: bo]');
  });

  it('translate-inuktitut produces the fallback prefix for an expanded input', () => {
    const result = expand(input, 'translate-inuktitut');
    expect(result).toContain('[no translation available: iu-cans]');
  });

  it('is deterministic: same input and mode → same output for all modes', () => {
    const modes: ExpandMode[] = [
      'verbose-lite',
      'verbose-full',
      'verbose-ultra',
      'translate-burmese',
      'translate-tibetan',
      'translate-inuktitut',
    ];
    for (const mode of modes) {
      expect(expand(input, mode)).toEqual(expand(input, mode));
    }
  });
});
