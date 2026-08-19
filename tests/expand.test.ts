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
    const longInput =
      'Use this to help. Start the process and decide on the next steps. Consider what to do.';
    const result = expand(longInput, 'verbose-ultra');
    expect(result.length).toBeGreaterThanOrEqual(longInput.length * 2);
  });

  // These four previously asserted the `[no translation available: …]` marker as
  // the EXPECTED output, which is how the translate modes stayed structurally
  // broken through 21 releases: translation ran after the English amplifiers, so
  // the phrasebook key could never match and not one non-Latin character was
  // ever emitted. The pipeline now translates per sentence first, then amplifies.
  const PHRASEBOOK_SENTENCE = 'The sun rises in the east.';

  it('translate-burmese emits Burmese script', () => {
    const result = expand(PHRASEBOOK_SENTENCE, 'translate-burmese');
    expect(result).toMatch(/\p{Script=Myanmar}/u);
    expect(result).not.toContain('no translation available');
  });

  it('translate-tibetan emits Tibetan script', () => {
    const result = expand(PHRASEBOOK_SENTENCE, 'translate-tibetan');
    expect(result).toMatch(/\p{Script=Tibetan}/u);
    expect(result).not.toContain('no translation available');
  });

  it('translate-inuktitut emits Canadian Aboriginal Syllabics', () => {
    const result = expand(PHRASEBOOK_SENTENCE, 'translate-inuktitut');
    expect(result).toMatch(/\p{Script=Canadian_Aboriginal}/u);
    expect(result).not.toContain('no translation available');
  });

  it('leaves a sentence the phrasebook does not know in English, unmarked', () => {
    const result = expand('Refactor the authentication middleware.', 'translate-burmese');
    expect(result).not.toContain('no translation available');
    expect(result.toLowerCase()).toContain('authentication');
  });

  it('anti-wenyan resolves to the same pipeline as translate-inuktitut', () => {
    // anti-wenyan is the canonical-name alias for the benchmark-winning natural
    // language under both cl100k_base and o200k_base (Inuktitut Syllabics).
    expect(expand(input, 'anti-wenyan')).toEqual(expand(input, 'translate-inuktitut'));
  });

  it('maxlang and the deprecated anti-wenyan alias are byte-identical', () => {
    // They share one Transform instance so the aliases cannot drift.
    expect(expand(PHRASEBOOK_SENTENCE, 'anti-wenyan')).toBe(
      expand(PHRASEBOOK_SENTENCE, 'maxlang'),
    );
    expect(expand(PHRASEBOOK_SENTENCE, 'maxlang')).toMatch(/\p{Script=Canadian_Aboriginal}/u);
  });

  it('verbose-galactic output is at least 1.5× the length of verbose-ultra', () => {
    const longInput =
      'Use this to help. Start the process and decide on the next steps. Consider what to do, of course.';
    const ultra = expand(longInput, 'verbose-ultra');
    const galactic = expand(longInput, 'verbose-galactic');
    expect(galactic.length).toBeGreaterThan(ultra.length * 1.5);
  });

  it('verbose-galactic applies Latin code-switching when "of course" appears', () => {
    const result = expand('Use this, of course.', 'verbose-galactic');
    expect(result).toContain('bien évidemment');
  });

  it('is deterministic: same input and mode → same output for all modes', () => {
    const modes: ExpandMode[] = [
      'verbose-lite',
      'verbose-full',
      'verbose-ultra',
      'verbose-galactic',
      'translate-burmese',
      'translate-tibetan',
      'translate-inuktitut',
      'anti-wenyan',
    ];
    for (const mode of modes) {
      expect(expand(input, mode)).toEqual(expand(input, mode));
    }
  });
});
