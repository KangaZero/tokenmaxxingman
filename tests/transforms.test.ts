import { describe, it, expect } from 'vitest';
import { synonyms } from '../src/transforms/synonyms.js';
import { qualifiers } from '../src/transforms/qualifiers.js';
import { nominalizations } from '../src/transforms/nominalizations.js';
import { passive } from '../src/transforms/passive.js';
import { translate } from '../src/transforms/translate.js';
import { splitOnSentenceBoundaries } from '../src/utils/text.js';

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

  // Regression: `\b` is ASCII-only, so every non-Latin character read as a
  // non-word character and "use" matched mid-word in any other script. This
  // project deliberately round-trips Syllabics, Burmese, and Cyrillic text, so
  // the boundary test has to be `\p{L}\p{M}\p{N}_` lookarounds under the `u` flag.
  it('does not substitute inside a word written in Canadian Syllabics', () => {
    const input = 'ᐊᐃuse';
    expect(synonyms(input)).toEqual(input);
  });

  it('does not substitute inside a word written in Burmese', () => {
    const input = 'မuseမ';
    expect(synonyms(input)).toEqual(input);
  });

  it('does not substitute inside a word written in Cyrillic', () => {
    const input = 'кириллицаuse';
    expect(synonyms(input)).toEqual(input);
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
    expect(nominalizations('We will implement this')).toContain('carry out the implementation of');
  });

  it('is deterministic: same input → same output', () => {
    const input = 'decide implement consider analyse evaluate determine';
    expect(nominalizations(input)).toEqual(nominalizations(input));
  });

  it('leaves unmatched verbs unchanged', () => {
    expect(nominalizations('The cat sat on the mat.')).toEqual('The cat sat on the mat.');
  });

  // Regression: `\breduce\b` matched the "reduce" inside an NFD grapheme, and the
  // orphaned combining acute then re-attached to the replacement's final "n"
  // ("effectuate a reduction iń") — corrupting a character the pattern never
  // matched. The `\p{M}` term in the lookarounds is what prevents this.
  it('does not match across a base letter that carries a combining mark', () => {
    const nfd = 'reduc' + 'e' + '\u0301';
    expect(nominalizations(nfd)).toEqual(nfd);
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

  // Gap: toPastParticiple — regular -es with consonant before -es (e.g. "fixes" → "fixed")
  // Hits the `withoutEs` path where the stem does NOT end in a vowel → appends "ed".
  it('converts regular -es verb (consonant stem) to past participle', () => {
    // "fixes": withoutEs = "fix", /[aeiou]$/.test("fix") is false → "fix" + "ed" = "fixed"
    const result = passive('The system fixes the bug.');
    expect(result).toContain('fixed');
    expect(result).toContain('by');
  });

  // Regression (CRITICAL, ReDoS): the subject group was once
  // `(?:\s+(?:the|a|an|...|[a-z]+))*` — an unbounded repetition in which every
  // literal alternative was also matched by `[a-z]+`, so each input word had
  // several parse paths and failure cost grew ~2x per added word. This exact
  // 121-byte input took 21,259 ms, and ~44 words took roughly 90 minutes, on the
  // single thread that serves the CLI, the library API, and the MCP server.
  // Wall-clock rather than a snapshot: the assertion is about complexity class.
  // The fixed pattern completes in well under a millisecond.
  it('completes on adversarial repeated-article input in linear time', () => {
    const adversarial = `Ok. The${' the'.repeat(28)} 1`;
    const started = performance.now();
    const result = passive(adversarial);
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(1000);
    expect(result).toEqual(passive(adversarial));
  });

  it('stays fast as the adversarial input grows', () => {
    const adversarial = `Ok. The${' the'.repeat(200)} 1`;
    const started = performance.now();
    passive(adversarial);
    expect(performance.now() - started).toBeLessThan(1000);
  });

  // Gap: toPastParticiple — verb ending in -s where base.length < 2 (e.g. "as", base "a")
  // The SVO pattern matches but toPastParticiple returns undefined → sentence returned unchanged.
  it('leaves sentence unchanged when verb base is a single character (base.length < 2)', () => {
    // "as": base = "a", length 1 → toPastParticiple returns undefined → no conversion
    const input = 'A as the thing.';
    expect(passive(input)).toEqual(input);
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

describe('splitOnSentenceBoundaries', () => {
  // Regression: the old `/(?<=[.!?])\s+/` split treated every period as a
  // sentence terminator, which shredded abbreviations and decimals and — once a
  // citation had been injected upstream — its own downstream output, leaving
  // "(cf;" and "pp.." in committed snapshots. Now backed by Intl.Segmenter with
  // an explicitly pinned locale plus an abbreviation-suppression list.
  it('keeps abbreviations attached to the sentence they belong to', () => {
    const input =
      'See Fig. 1 for details. It works vs. the alternative. Dr. Smith agrees. e.g. this one.';
    expect(splitOnSentenceBoundaries(input)).toEqual([
      'See Fig. 1 for details.',
      'It works vs. the alternative.',
      'Dr. Smith agrees. e.g. this one.',
    ]);
  });

  it('does not split a decimal number across two sentences', () => {
    expect(splitOnSentenceBoundaries('Pi is 3. 14159 is next.')).toEqual([
      'Pi is 3. 14159 is next.',
    ]);
  });

  it.each([
    ['e.g.', 'Consider e.g. Smith and the rest.'],
    ['i.e.', 'Consider i.e. Smith and the rest.'],
    ['vs.', 'Consider vs. Smith and the rest.'],
    ['Dr.', 'Consider Dr. Smith and the rest.'],
    ['Fig.', 'Consider Fig. Smith and the rest.'],
  ])('treats a trailing %s as an abbreviation, not a sentence end', (_label, input) => {
    expect(splitOnSentenceBoundaries(input)).toEqual([input]);
  });

  it('does not split inside an injected citation', () => {
    const input =
      'warrants serious attention (cf. Flibbertigibbet & Wobblejaw, 2099, pp. 1,492–1,501, "Annals of Profoundly Obvious Research").';
    expect(splitOnSentenceBoundaries(input)).toEqual([input]);
  });

  it('still splits on genuine sentence boundaries', () => {
    expect(splitOnSentenceBoundaries('One thing. Another thing! A third?')).toEqual([
      'One thing.',
      'Another thing!',
      'A third?',
    ]);
  });

  it('keeps a soft line break inside one chunk rather than flattening it', () => {
    expect(splitOnSentenceBoundaries('Line one\nLine two')).toEqual(['Line one\nLine two']);
  });

  it('trims each sentence and drops empty fragments', () => {
    expect(splitOnSentenceBoundaries('  Hello.   World.  ')).toEqual(['Hello.', 'World.']);
    expect(splitOnSentenceBoundaries('')).toEqual([]);
  });

  it('is deterministic: same input → same output', () => {
    const input = 'Dr. Smith agrees. Pi is 3. 14159 is next.';
    expect(splitOnSentenceBoundaries(input)).toEqual(splitOnSentenceBoundaries(input));
  });
});
