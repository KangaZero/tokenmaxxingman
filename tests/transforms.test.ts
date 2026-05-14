import { describe, it, expect } from 'vitest';
import { synonyms } from '../src/transforms/synonyms.js';
import { qualifiers } from '../src/transforms/qualifiers.js';
import { nominalizations } from '../src/transforms/nominalizations.js';
import { passive } from '../src/transforms/passive.js';
import { translate } from '../src/transforms/translate.js';

describe('synonyms', () => {
  it('replaces "use" with "utilize"', () => {
    expect(synonyms('use the API')).toContain('utilize');
  });

  it('replaces "help" with "facilitate"', () => {
    expect(synonyms('I will help you')).toContain('facilitate');
  });

  it('preserves casing on capitalised words', () => {
    expect(synonyms('Use the API')).toContain('Utilize');
  });

  it('does not replace substrings inside other words', () => {
    const result = synonyms('The users are here');
    // "users" should not be touched; "use" is word-boundary only
    expect(result).toContain('users');
  });

  it('is deterministic: same input → same output', () => {
    const input = 'use help start end make show do get give find';
    expect(synonyms(input)).toEqual(synonyms(input));
  });
});

describe('qualifiers', () => {
  it('makes the output longer than the input', () => {
    expect(qualifiers('Hello.').length).toBeGreaterThan('Hello.'.length);
  });

  it('injects a hedge phrase into the output', () => {
    const result = qualifiers('The report is complete.');
    expect(result).not.toEqual('The report is complete.');
  });

  it('is deterministic: same input → same output', () => {
    const input = 'We proceed. The team agrees.';
    expect(qualifiers(input)).toEqual(qualifiers(input));
  });

  it('handles multi-sentence input', () => {
    const input = 'We proceed. The team agrees. Work is done.';
    const result = qualifiers(input);
    expect(result.length).toBeGreaterThan(input.length);
  });
});

describe('nominalizations', () => {
  it('converts "decide" to a noun-phrase form', () => {
    expect(nominalizations('We must decide now')).toContain(
      'make a decision regarding the matter of',
    );
  });

  it('converts "implement" to a noun-phrase form', () => {
    expect(nominalizations('We will implement this')).toContain(
      'carry out the implementation of',
    );
  });

  it('is deterministic: same input → same output', () => {
    const input = 'decide implement consider analyse evaluate determine';
    expect(nominalizations(input)).toEqual(nominalizations(input));
  });

  it('leaves unmatched verbs unchanged', () => {
    expect(nominalizations('The cat sat on the mat.')).toEqual(
      'The cat sat on the mat.',
    );
  });
});

describe('passive', () => {
  it('converts a simple active SVO sentence to passive', () => {
    const result = passive('The team builds the feature.');
    expect(result).toContain('built');
    expect(result).toContain('by');
  });

  it('leaves a sentence unchanged when the pattern does not match', () => {
    const complex = 'Although many factors are at play, the situation remains complex.';
    expect(passive(complex)).toEqual(complex);
  });

  it('is deterministic: same input → same output', () => {
    const input = 'The team builds the feature.';
    expect(passive(input)).toEqual(passive(input));
  });

  it('does not mangle sentences it cannot parse', () => {
    const input = 'It is important to note several caveats.';
    const result = passive(input);
    // Must return unchanged (no confident SVO match) rather than garbled output
    expect(result).toEqual(input);
  });
});

describe('translate', () => {
  it('returns a Burmese string for a known phrase', () => {
    const result = translate('Hello.', 'my');
    expect(result).toEqual('မင်္ဂလာပါ။');
  });

  it('returns a Tibetan string for a known phrase', () => {
    const result = translate('Hello.', 'bo');
    expect(result).toEqual('བཀྲ་ཤིས་བདེ་ལེགས།');
  });

  it('returns the fallback prefix for an unknown phrase', () => {
    const result = translate('An unknown sentence.', 'my');
    expect(result).toContain('[no translation available: my]');
    expect(result).toContain('An unknown sentence.');
  });

  it('returns the fallback prefix for an unknown language code', () => {
    const result = translate('Hello.', 'xx');
    expect(result).toContain('[no translation available: xx]');
    expect(result).toContain('Hello.');
  });

  it('is deterministic: same input → same output', () => {
    expect(translate('Hello.', 'my')).toEqual(translate('Hello.', 'my'));
  });
});
