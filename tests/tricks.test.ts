import { describe, it, expect } from 'vitest';
import { padding } from '../src/tricks/padding.js';
import { repetition } from '../src/tricks/repetition.js';
import { footnotes } from '../src/tricks/footnotes.js';
import { parentheticals } from '../src/tricks/parentheticals.js';
import { citation } from '../src/tricks/citation.js';

const MULTI_SENTENCE =
  'The quick fox runs fast. The lazy dog sleeps. Every result matters greatly.';
const SINGLE_WORD = 'Hello';
const EMPTY = '';

describe('padding', () => {
  it('is deterministic', () => {
    expect(padding(MULTI_SENTENCE)).toEqual(padding(MULTI_SENTENCE));
  });

  it('output is strictly longer than input', () => {
    expect(padding(MULTI_SENTENCE).length).toBeGreaterThan(MULTI_SENTENCE.length);
  });

  it('does not throw on empty input', () => {
    expect(() => padding(EMPTY)).not.toThrow();
    expect(padding(EMPTY)).toEqual(EMPTY);
  });

  it('does not throw on single-word input', () => {
    expect(() => padding(SINGLE_WORD)).not.toThrow();
  });

  it('respects targetMultiplier — higher multiplier produces more output', () => {
    const low = padding(MULTI_SENTENCE, { targetMultiplier: 2 });
    const high = padding(MULTI_SENTENCE, { targetMultiplier: 5 });
    expect(high.length).toBeGreaterThanOrEqual(low.length);
  });

  // Gap: single sentence with no trailing space — triggers the end-of-loop `current.trim().length > 0`
  // path in splitOnSentenceBoundaries AND the while-loop padding extension (output still under target).
  it('pads a single short sentence via the while-loop extension to exceed targetMultiplier length', () => {
    const short = 'Go.';
    const result = padding(short, { targetMultiplier: 3 });
    // After padding, the output must be >= 3x the original length
    expect(result.length).toBeGreaterThanOrEqual(short.length * 3);
    // The while-loop appends one of the PADDING_PHRASES
    expect(result).toContain('the substance of the preceding statement warrants serious attention');
  });

  // Regression: the append loop's bound used to be
  // `PADDING_PHRASES.length * multiplier`, i.e. it scaled with the input it was
  // supposed to guard against. `targetMultiplier: 100_000` on 4.4 KB of text
  // produced 419.6 MB in 3,993 ms. Both bounds are now constants, so an absurd
  // multiplier is bounded in size and time without any caller-side clamp.
  it('bounds output size and runtime for an absurd targetMultiplier', () => {
    const input = 'The quick fox runs fast. The lazy dog sleeps soundly. Every result matters. '
      .repeat(53)
      .trim();
    const started = performance.now();
    const result = padding(input, { targetMultiplier: 100_000 });
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(1000);
    // Comfortably inside the 1 MiB ceiling, and nowhere near 419.6 MB.
    expect(result.length).toBeLessThan(1_048_576);
  });

  it('never exceeds the absolute output ceiling regardless of multiplier', () => {
    const input = 'A sentence. '.repeat(200).trim();
    for (const targetMultiplier of [1, 100, 10_000, 1_000_000]) {
      expect(padding(input, { targetMultiplier }).length).toBeLessThanOrEqual(1_048_576);
    }
  });

  it('remains deterministic under a clamped multiplier', () => {
    const input = 'One thing. Two things. Three things.';
    expect(padding(input, { targetMultiplier: 100_000 })).toEqual(
      padding(input, { targetMultiplier: 100_000 }),
    );
  });
});

describe('repetition', () => {
  it('is deterministic', () => {
    expect(repetition(MULTI_SENTENCE)).toEqual(repetition(MULTI_SENTENCE));
  });

  it('output is strictly longer than input', () => {
    expect(repetition(MULTI_SENTENCE).length).toBeGreaterThan(MULTI_SENTENCE.length);
  });

  it('does not throw on empty input', () => {
    expect(() => repetition(EMPTY)).not.toThrow();
    expect(repetition(EMPTY)).toEqual(EMPTY);
  });

  it('does not throw on single-word input', () => {
    expect(() => repetition(SINGLE_WORD)).not.toThrow();
  });

  it('output contains a connector phrase', () => {
    const result = repetition(MULTI_SENTENCE);
    expect(result).toMatch(/put differently|stated another way|to rephrase|in other words/i);
  });

  // Gap: sentence without trailing punctuation — hits the trailingPunct fallback to '.' branch.
  it('handles sentence without trailing punctuation — appends a period connector', () => {
    const noPunct = 'Hello world';
    const result = repetition(noPunct);
    // The semicolon connector is still inserted and a period appended
    expect(result).toContain('; put differently,');
    expect(result.endsWith('.')).toBe(true);
  });
});

describe('footnotes', () => {
  it('is deterministic', () => {
    expect(footnotes(MULTI_SENTENCE)).toEqual(footnotes(MULTI_SENTENCE));
  });

  it('output is strictly longer than input', () => {
    expect(footnotes(MULTI_SENTENCE).length).toBeGreaterThan(MULTI_SENTENCE.length);
  });

  it('does not throw on empty input', () => {
    expect(() => footnotes(EMPTY)).not.toThrow();
    expect(footnotes(EMPTY)).toEqual(EMPTY);
  });

  it('does not throw on single-word input', () => {
    expect(() => footnotes(SINGLE_WORD)).not.toThrow();
  });

  it('output contains at least one footnote phrase from the bank', () => {
    const result = footnotes(MULTI_SENTENCE);
    expect(result).toContain('(');
    // Match phrases that are known to appear from the bank for this input length.
    expect(result).toMatch(
      /this expression, though widely employed|the semantic load carried by this word|this phrase has acquired|this concept, deceptively simple/i,
    );
  });
});

describe('parentheticals', () => {
  it('is deterministic', () => {
    expect(parentheticals(MULTI_SENTENCE)).toEqual(parentheticals(MULTI_SENTENCE));
  });

  it('output is strictly longer than input for text containing conjunctions', () => {
    const withConjunctions = 'The fox and the dog run fast but the cat sleeps.';
    expect(parentheticals(withConjunctions).length).toBeGreaterThan(withConjunctions.length);
  });

  it('does not throw on empty input', () => {
    expect(() => parentheticals(EMPTY)).not.toThrow();
    expect(parentheticals(EMPTY)).toEqual(EMPTY);
  });

  it('does not throw on single-word input', () => {
    expect(() => parentheticals(SINGLE_WORD)).not.toThrow();
  });

  it('injects nested parentheticals after conjunctions', () => {
    const input = 'The fox and the dog sleep.';
    const result = parentheticals(input);
    // Should contain at least double-nested parens from our aside bank.
    expect(result).toMatch(/\(.*\(.*\)/);
  });

  // Regression: `/\b(and|but|or|however)\b/gi` treated Cyrillic letters as
  // non-word characters, so "and" was found inside a single Cyrillic word and an
  // entire nested clause was injected into the middle of it.
  it('does not inject inside a word from a non-Latin script', () => {
    const input = 'кandк';
    expect(parentheticals(input)).toEqual(input);
  });
});

describe('citation', () => {
  it('is deterministic', () => {
    expect(citation(MULTI_SENTENCE)).toEqual(citation(MULTI_SENTENCE));
  });

  it('output is strictly longer than input', () => {
    expect(citation(MULTI_SENTENCE).length).toBeGreaterThan(MULTI_SENTENCE.length);
  });

  it('does not throw on empty input', () => {
    expect(() => citation(EMPTY)).not.toThrow();
    expect(citation(EMPTY)).toEqual(EMPTY);
  });

  it('does not throw on single-word input', () => {
    expect(() => citation(SINGLE_WORD)).not.toThrow();
  });

  it('inserted citation contains a clearly fabricated absurd year from the phrase bank', () => {
    // Our phrase bank contains years like 2099, 1066, 3001, 9999 — unmistakably absurd.
    const result = citation(MULTI_SENTENCE);
    expect(result).toMatch(/\d{4}/);
    // At least one citation marker is present (the bank uses "see", "cf.", "per").
    expect(result).toMatch(/\(see |cf\. |per |contra |following |attributed to /i);
  });

  it('citations contain fabricated absurd author names', () => {
    const result = citation(MULTI_SENTENCE);
    // The bank contains names like Blobsworth, Quackenheimer, Flibbertigibbet — check for one.
    expect(result).toMatch(
      /Blobsworth|Quackenheimer|Flibbertigibbet|Wobblejaw|Mumpsimusson|Nonsensborough|Sploosh|Kersplunk/i,
    );
  });

  // Gap: single sentence input — index is always 0 (even), so the citation branch (index % 2 === 1)
  // is never entered and the sentence is returned unchanged.
  it('returns single sentence unchanged — no citation inserted for only one sentence', () => {
    const single = 'Hello world.';
    const result = citation(single);
    expect(result).toEqual(single);
  });

  // Regression: pool selection used `index % FAKE_CITATIONS.length` while the
  // "does this sentence get a citation?" test was `index % 2 === 1`. Over an
  // even-length pool only odd slots were reachable, so 10 of the 20 citations
  // were dead code. Pool selection now has its own counter.
  it('reaches every citation in the pool', () => {
    const sentences = Array.from(
      { length: 120 },
      (_unused, i) => `Sentence number ${String(i)} is here.`,
    ).join(' ');
    const result = citation(sentences);
    const cited = result.match(/\((?:see|cf\.|per|contra|following|attributed to)[^)]*\)/g) ?? [];
    const distinct = new Set(cited);

    expect(distinct.size).toBeGreaterThan(10);
    expect(distinct.size).toBe(20);
  });

  // Gap: citation appended to sentence WITHOUT trailing punctuation — trailingPunct is ''
  // so the body equals the full sentence and the cite is appended directly.
  it('appends citation to sentence with no trailing punctuation', () => {
    // Two sentences needed so the second (index 1) gets a citation.
    // Second sentence has no trailing punctuation.
    const input = 'First sentence. Second sentence without punct';
    const result = citation(input);
    // The second sentence (no trailing punct) should have a citation appended after its body.
    expect(result).toMatch(/Second sentence without punct \(see |cf\. |per /i);
  });
});
