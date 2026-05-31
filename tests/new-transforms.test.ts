import { describe, it, expect } from 'vitest';
import { reduplication } from '../src/tricks/reduplication.js';
import { rhetoricalQuestions } from '../src/tricks/rhetorical-questions.js';
import { codeSwitching } from '../src/transforms/code-switching.js';

describe('reduplication', () => {
  it('doubles "big" into its triplet form', () => {
    expect(reduplication('a big house')).toContain('big-big-big');
  });

  it('replaces "very" with a chained quadruple', () => {
    expect(reduplication('it is very heavy')).toContain('very-very-very-very');
  });

  it('preserves capitalisation at sentence start', () => {
    const out = reduplication('Big things ahead.');
    // First letter must remain capital after substitution.
    expect(out.startsWith('Big-big-big')).toBe(true);
  });

  it('leaves words outside the lookup untouched', () => {
    expect(reduplication('the quiet stranger arrived')).toEqual('the quiet stranger arrived');
  });

  it('does not match substrings inside larger words', () => {
    // "biggest" must not pick up the "big" substring rule.
    const out = reduplication('biggest gain');
    expect(out).toContain('biggest');
    expect(out).not.toContain('big-big-big-gest');
  });

  it('is deterministic', () => {
    const input = 'big small good bad new old';
    expect(reduplication(input)).toEqual(reduplication(input));
  });
});

describe('rhetoricalQuestions', () => {
  it('injects an interjection on even-indexed sentences', () => {
    const input = 'The first sentence here is reasonably substantive. The second is briefer.';
    const out = rhetoricalQuestions(input);
    expect(out).toContain('—');
    expect(out.length).toBeGreaterThan(input.length);
  });

  it('skips sentences below the minimum-words threshold', () => {
    // 3 words — below the 4-word floor.
    const out = rhetoricalQuestions('Yes. No.');
    expect(out).toEqual('Yes. No.');
  });

  it('returns the input unchanged when there are no sentence boundaries', () => {
    expect(rhetoricalQuestions('')).toEqual('');
  });

  it('is deterministic across calls', () => {
    const input = 'One two three four five. Six seven eight nine ten. Eleven twelve thirteen fourteen.';
    expect(rhetoricalQuestions(input)).toEqual(rhetoricalQuestions(input));
  });

  it('alternates: only every other sentence gets an interjection', () => {
    const input = 'One two three four. One two three four. One two three four. One two three four.';
    const out = rhetoricalQuestions(input);
    const dashCount = (out.match(/—/g) ?? []).length;
    // Each interjection contains exactly two em-dashes (one open, one close).
    // 4 sentences, indices 0 and 2 injected → 2 interjections → 4 dashes.
    expect(dashCount).toBe(4);
  });
});

describe('codeSwitching', () => {
  it('rewrites "of course" with bien évidemment', () => {
    expect(codeSwitching('it is, of course, well known')).toContain('bien évidemment');
  });

  it('rewrites "therefore" with quod erat demonstrandum', () => {
    expect(codeSwitching('therefore the result holds')).toContain('quod erat demonstrandum');
  });

  it('handles case-insensitive matching but preserves the original literal', () => {
    const out = codeSwitching('However, the situation has changed.');
    expect(out).toContain('However (or, if one prefers');
  });

  it('matches multiple triggers in the same input', () => {
    const out = codeSwitching('Therefore, of course, the conclusion follows.');
    expect(out).toContain('quod erat demonstrandum');
    expect(out).toContain('bien évidemment');
  });

  it('leaves untriggered text unchanged', () => {
    expect(codeSwitching('the cat sat on the mat.')).toEqual('the cat sat on the mat.');
  });

  it('is deterministic', () => {
    const input = 'However, therefore, of course, notably, basically, specifically.';
    expect(codeSwitching(input)).toEqual(codeSwitching(input));
  });
});
