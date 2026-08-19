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

  it('targetLanguage: my emits Burmese script and no diagnostic marker', () => {
    // Previously this accepted EITHER Burmese OR the `[no translation
    // available: my]` marker, so it passed while translation was a no-op.
    // `maxxer` now translates before amplifying, so a phrasebook sentence must
    // actually come back in Burmese.
    const result = maxxer('The sun rises in the east.', { targetLanguage: 'my' });
    expect(result).toMatch(/\p{Script=Myanmar}/u);
    expect(result).not.toContain('no translation available');
  });

  it('does not throw on empty input', () => {
    expect(() => maxxer('')).not.toThrow();
  });

  it('paddingMultiplier option is respected — higher multiplier yields more output', () => {
    const low = maxxer(SHORT_INPUT, { paddingMultiplier: 2, passes: 1 });
    const high = maxxer(SHORT_INPUT, { paddingMultiplier: 4, passes: 1 });
    expect(high.length).toBeGreaterThanOrEqual(low.length);
  });

  // MEMORY_BUDGET_BYTES caps growth ACROSS passes: a large input is still expanded
  // once, then the budget halts further passes. So an oversized input is transformed
  // (not returned unchanged), and passes:3 collapses to the same single-pass output.
  it('returns an already-oversized input untouched rather than amplifying it', () => {
    // Previously this asserted the input was expanded once ANYWAY, which is how
    // a 188-byte input could reach 10.85 MB at passes:3 — 11x the stated 1 MB
    // budget. Amplifying something already over budget is the denial-of-service
    // case; truncating it instead would be data loss. So: returned as-is.
    const oversizedInput = 'x'.repeat(1_048_577); // 1 MB + 1 byte
    expect(maxxer(oversizedInput, { passes: 1 })).toBe(oversizedInput);
    expect(maxxer(oversizedInput, { passes: 3 })).toBe(oversizedInput);
  });

  it('never exceeds the 1 MB budget for an input that starts under it', () => {
    const output = maxxer('The sun rises in the east. The cat sits.', { passes: 5 });
    expect(output.length).toBeLessThanOrEqual(1_048_576);
  });

  it('maxxerParallel is byte-identical to maxxer', async () => {
    // These are documented as equivalent but diverged at character 3,469 on a
    // 5-sentence input, because chunking restarted the sentence index that
    // several transforms use to pick their content.
    const inputs = [
      'Hello.',
      'The cat sits. The dog runs. A bird flies. The fish swims. The mouse hides.',
      'The sun rises in the east.',
    ];
    for (const input of inputs) {
      for (const opts of [{}, { passes: 2 }, { paddingMultiplier: 5 }, { targetLanguage: 'my' as const }]) {
        expect(await maxxerParallel(input, opts), input).toBe(maxxer(input, opts));
      }
    }
  });

  // Gap: snapshot test — pins the deterministic output of a single-pass expansion with
  // paddingMultiplier: 2 so any pipeline change is caught immediately.
  it('produces a stable deterministic snapshot for Hello, world. (passes:1, paddingMultiplier:2)', () => {
    const result = maxxer('Hello, world.', { passes: 1, paddingMultiplier: 2 });
    expect(result).toMatchInlineSnapshot(
      `"It is, of (this expression, though widely employed, does not admit of a single unambiguous interpretation) course, important-and (though one might argue (and indeed many have argued (often without success)) that this is a matter of perspective)-truly-of-paramount-importance to (the semantic load carried by this word is, upon reflection, rather heavier than it might initially appear) note that hello, (this phrase has acquired, over time, a somewhat specialised meaning that diverges from its etymological origins) world, as the (this concept, deceptively simple on its surface, has occupied the attention of numerous theorists) case may be. (the referent of this expression is, in certain philosophical traditions, considered deeply problematic) Furthermore, and (notwithstanding the obvious (and frequently overlooked (much to the detriment of clarity)) counterarguments) this (this word, innocuous as it appears, has been known to generate considerable confusion among readers) cannot be overstated, (suffice it to say that this phrase carries more theoretical weight than its apparent simplicity suggests) the substance of (a careful reader will observe that this phrasing is, in fact, a conventional simplification of a more nuanced reality) the preceding statement (one would be remiss not to acknowledge that this particular term is not universally accepted in all contexts) warrants serious attention. (the employment of this terminology is, strictly speaking, a matter of convention rather than logical necessity); put differently, it — but is that not, when one really stops to consider it carefully, the most fundamental observation one could hope to articulate on a matter of this kind? — is, of (this expression, though widely employed, does not admit of a single unambiguous interpretation) course, important-and (though one might argue (and indeed many have argued (often without success)) that this is a matter of perspective)-truly-of-paramount-importance to (the semantic load carried by this word is, upon reflection, rather heavier than it might initially appear) note that hello, (this phrase has acquired, over time, a somewhat specialised meaning that diverges from its etymological origins) world, as the (this concept, deceptively straightforward in its fundamental conceptual architecture on its surface, has occupied the attention of numerous theorists) case may be. (the referent of this expression is, in certain philosophical traditions, considered deeply problematic) Furthermore, and (notwithstanding the obvious (and frequently overlooked (much to the detriment of clarity)) counterarguments) this (this word, innocuous as it appears, has been known to generate considerable confusion among readers) cannot be overstated, (suffice it to articulate that this phrase carries more theoretical weight than its apparent simplicity suggests) the substance of (a careful reader will observe that this phrasing is, in fact, a conventional simplification of a more nuanced reality) the preceding statement (one would be remiss not to acknowledge that this particular term is not universally accepted in all contexts) warrants serious attention. (the employment of this terminology is, strictly speaking, a matter of convention rather than logical necessity)."`,
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

  it('with passes option produces output longer than input', async () => {
    const result = await maxxerParallel(LONGER_INPUT, { passes: 1 });
    expect(result.length).toBeGreaterThan(LONGER_INPUT.length);
  });

  it('two calls with the same options produce identical output', async () => {
    const first = await maxxerParallel(LONGER_INPUT, { passes: 1 });
    const second = await maxxerParallel(LONGER_INPUT, { passes: 1 });
    expect(first).toEqual(second);
  });
});
