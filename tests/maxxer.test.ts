import { describe, it, expect } from 'vitest';
import { maxxer, maxxerParallel } from '../src/maxxer.js';

const SHORT_INPUT = 'Hello world.';
const LONGER_INPUT =
  'The quick fox runs fast. The lazy dog sleeps soundly. Every result matters greatly. Science builds knowledge.';

describe('maxxer', () => {
  it('produces output at least 10× longer than the input', () => {
    const result = maxxer(SHORT_INPUT);
    expect(result.length).toBeGreaterThanOrEqual(SHORT_INPUT.length * 10);
  });

  it('passes: 2 produces longer output than passes: 1', () => {
    const one = maxxer(LONGER_INPUT, { passes: 1 });
    const two = maxxer(LONGER_INPUT, { passes: 2 });
    expect(two.length).toBeGreaterThan(one.length);
  });

  it('passes > 5 is clamped to 5', () => {
    // Clamped to 5 and unclamped 5 must produce identical output.
    const clamped = maxxer(SHORT_INPUT, { passes: 99 });
    const explicit = maxxer(SHORT_INPUT, { passes: 5 });
    expect(clamped).toEqual(explicit);
  });

  it('is deterministic: same input → same output', () => {
    expect(maxxer(SHORT_INPUT)).toEqual(maxxer(SHORT_INPUT));
    expect(maxxer(LONGER_INPUT, { passes: 2 })).toEqual(maxxer(LONGER_INPUT, { passes: 2 }));
  });

  it('targetLanguage: unknown code includes the fallback marker or Burmese script', () => {
    const result = maxxer(SHORT_INPUT, { targetLanguage: 'my' });
    const hasFallback = result.includes('[no translation available: my]');
    // Burmese Unicode block: U+1000–U+109F
    const hasBurmese = /[က-႟]/.test(result);
    expect(hasFallback || hasBurmese).toBe(true);
  });

  it('does not throw on empty input', () => {
    expect(() => maxxer('')).not.toThrow();
  });

  it('paddingMultiplier option is respected — higher multiplier yields more output', () => {
    const low = maxxer(SHORT_INPUT, { paddingMultiplier: 2, passes: 1 });
    const high = maxxer(SHORT_INPUT, { paddingMultiplier: 4, passes: 1 });
    expect(high.length).toBeGreaterThanOrEqual(low.length);
  });

  // Gap: MEMORY_BUDGET_BYTES short-circuit — input already > 1 MB causes the loop to break
  // on the very first iteration check, returning the input unchanged.
  it('returns input unchanged when it already exceeds the 1 MB memory budget', () => {
    const oversizedInput = 'x'.repeat(1_048_577); // 1 MB + 1 byte
    const result = maxxer(oversizedInput, { passes: 3 });
    expect(result).toBe(oversizedInput);
  });

  // Gap: snapshot test — pins the deterministic output of a single-pass expansion with
  // paddingMultiplier: 2 so any pipeline change is caught immediately.
  it('produces a stable deterministic snapshot for Hello, world. (passes:1, paddingMultiplier:2)', () => {
    const result = maxxer('Hello, world.', { passes: 1, paddingMultiplier: 2 });
    expect(result).toMatchInlineSnapshot(
      `"It is, of (this expression, though widely employed, does not admit of a single unambiguous interpretation) course, important to (the semantic load carried by this word is, upon reflection, rather heavier than it might initially appear) note that hello, (this phrase has acquired, over time, a somewhat specialised meaning that diverges from its etymological origins) world, as the (this concept, deceptively simple on its surface, has occupied the attention of numerous theorists) case may be; put differently, it is, of (this expression, though widely employed, does not admit of a single unambiguous interpretation) course, important to (the semantic load carried by this word is, upon reflection, rather heavier than it might initially appear) note that hello, (this phrase has acquired, over time, a somewhat specialised meaning that diverges from its etymological origins) world, as the (this concept, deceptively straightforward in its fundamental conceptual architecture on its surface, has occupied the attention of numerous theorists) case may be.. (the referent of this expression is, in certain philosophical traditions, considered deeply problematic) Furthermore, and (though one might argue (and indeed many have argued (often without success)) that this is a matter of perspective) this (this word, innocuous as it appears, has been known to generate considerable confusion among readers) cannot be overstated, (suffice it to say that this phrase carries more theoretical weight than its apparent simplicity suggests) the substance of (a careful reader will observe that this phrasing is, in fact, a conventional simplification of a more nuanced reality) the preceding statement (one would be remiss not to acknowledge that this particular term is not universally accepted in all contexts) warrants serious attention (cf; stated another way, (the referent of this expression is, in certain philosophical traditions, considered deeply problematic) Furthermore, and (though one might argue (and indeed many have argued (often without success)) that this is a matter of perspective) this (this word, innocuous as it appears, has been known to generate considerable confusion among readers) cannot be overstated, (suffice it to articulate that this phrase carries more theoretical weight than its apparent simplicity suggests) the substance of (a careful reader will observe that this phrasing is, in fact, a conventional simplification of a more nuanced reality) the preceding statement (one would be remiss not to acknowledge that this particular term is not universally accepted in all contexts) warrants serious attention (cf.. Flibbertigibbet & Wobblejaw, 2099, pp; to rephrase this observation, flibbertigibbet & Wobblejaw, 2099, pp.. 1,492–1,501, "Annals of Profoundly Obvious Research"); or, to express the same sentiment through alternative phrasing, 1,492–1,501, "Annals of Profoundly Obvious Research").. (the employment of this terminology is, strictly speaking, a matter of convention rather than logical necessity); in other words and with slightly altered construction, (the employment of this terminology is, strictly speaking, a matter of convention rather than logical necessity)."`,
    );
  });
});

describe('maxxerParallel', () => {
  it('returns a string', async () => {
    const result = await maxxerParallel(SHORT_INPUT);
    expect(typeof result).toBe('string');
  });

  it('is deterministic', async () => {
    const a = await maxxerParallel(LONGER_INPUT);
    const b = await maxxerParallel(LONGER_INPUT);
    expect(a).toEqual(b);
  });

  it('produces output longer than input', async () => {
    const result = await maxxerParallel(LONGER_INPUT);
    expect(result.length).toBeGreaterThan(LONGER_INPUT.length);
  });

  it('does not throw on empty input', async () => {
    await expect(maxxerParallel('')).resolves.not.toThrow();
  });

  it('workers option does not crash and still produces output', async () => {
    const result = await maxxerParallel(LONGER_INPUT, { workers: 4 });
    expect(result.length).toBeGreaterThan(LONGER_INPUT.length);
  });

  it('workers > 8 is clamped to 8', async () => {
    const clamped = await maxxerParallel(LONGER_INPUT, { workers: 99 });
    const explicit = await maxxerParallel(LONGER_INPUT, { workers: 8 });
    expect(clamped).toEqual(explicit);
  });
});
