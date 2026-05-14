# Test Report — tokenmaxxingman

Generated: 2026-05-14T08:46:43Z
Branch: feat/initial-build

## Summary

- Total test files: 10
- Total tests: 133 (133 passed / 0 failed)
- Coverage: 93.95% statements / 82.8% branches / 100% functions / 98.61% lines

## Per-file coverage

| File | Stmts | Branch | Func | Lines |
|------|-------|--------|------|-------|
| src/benchmark.ts | 100% | 100% | 100% | 100% |
| src/expand.ts | 92.85% | 50% | 100% | 92.3% |
| src/index.ts | 100% | 100% | 100% | 100% |
| src/maxxer.ts | 100% | 100% | 100% | 100% |
| src/speedrun.ts | 100% | 69.23% | 100% | 100% |
| src/tokenizer.ts | 100% | 100% | 100% | 100% |
| src/corpus-types.ts | 100% | 100% | 100% | 100% |
| src/transforms/nominalizations.ts | 86.66% | 75% | 100% | 100% |
| src/transforms/passive.ts | 90% | 85% | 100% | 88.46% |
| src/transforms/qualifiers.ts | 89.47% | 80% | 100% | 100% |
| src/transforms/synonyms.ts | 86.66% | 75% | 100% | 100% |
| src/transforms/translate.ts | 100% | 100% | 100% | 100% |
| src/transforms/index.ts | 100% | 100% | 100% | 100% |
| src/tricks/citation.ts | 88.88% | 83.33% | 100% | 100% |
| src/tricks/footnotes.ts | 95% | 80% | 100% | 100% |
| src/tricks/padding.ts | 92.45% | 78.57% | 100% | 100% |
| src/tricks/parentheticals.ts | 91.66% | 75% | 100% | 100% |
| src/tricks/repetition.ts | 91.3% | 83.33% | 100% | 100% |
| src/tricks/index.ts | 100% | 100% | 100% | 100% |
| src/formatters/markdown.ts | 100% | 100% | 100% | 100% |
| src/formatters/json.ts | 100% | 100% | 100% | 100% |

## Gaps identified and addressed

The following gaps were fixed by adding 14 targeted tests across 5 files:

- **`tests/transforms.test.ts`**: Added `passive` — regular `-es` verb with consonant stem (`"fixes"` → L52-56 of `toPastParticiple`) and `base.length < 2` guard (`"as"` verb → L61 of `toPastParticiple`).
- **`tests/tricks.test.ts`**: Added `padding` — single short sentence triggering the while-loop extension path (L96-101). Added `repetition` — sentence without trailing punctuation hitting the `trailingPunct` fallback branch. Added `citation` — single sentence input (only index 0, never triggers the odd-index citation branch) and two-sentence input where the second has no trailing punctuation (hits `trailingPunct === ''` path).
- **`tests/benchmark.test.ts`**: Added four tests — language with no translations (`totalCharacters === 0` → `tokensPerCharacter = 0`), empty sentences array (`sentenceCount === 0` → `tokensPerSentence = 0`), secondary sort by `tokensPerSentence` tiebreaker (L64-65), and tertiary `localeCompare` tiebreaker (L67).
- **`tests/speedrun.test.ts`**: Added `maxIterations: 0` test (zero iterations, `tokensPerSecond` is 0 not NaN via the `seconds > 0` guard at L80-81) and a large-seed test that forces `output.length > OUTPUT_CAP` to trigger the `currentInput` slicing at L68.
- **`tests/maxxer.test.ts`**: Added `MEMORY_BUDGET_BYTES` short-circuit test (input > 1 MB returns unchanged) and the `toMatchInlineSnapshot` snapshot test for `maxxer('Hello, world.', { passes: 1, paddingMultiplier: 2 })`.

## Known limitations

- **`src/expand.ts` L48 — branch: 50%**: The `pipeline === undefined` guard is structurally unreachable: `ExpandMode` is a closed union and `PIPELINES` is statically populated with all six members. Exercising this branch would require a `as unknown as ExpandMode` cast. Documented as intentional defensive code; not worth a test.
- **`src/speedrun.ts` L68-83 — branch: 69.23%**: The `seconds > 0` ternary false path (L80-81) would require `performance.now()` to return 0 after a full run, which is impossible on real hardware without mocking `performance.now`. The `maxIterations: 0` test gets iterations to 0 but `actualMs` is still > 0 microseconds. Mocking `performance` is excluded per the plan's no-mock-divergence rule. Flagged, not forced.
- **`src/transforms/synonyms.ts` L66-68 / `src/transforms/nominalizations.ts` L35-37 — branch: 75%**: The `applyCase` function's `original.length === 0` and `firstChar === undefined` branches are unreachable via the public API. The `RegExp` `\b(word)\b` match can only produce a non-empty `match` string. Both are post-null-check defensive guards. Not fabricating a test using internal access.
- **`src/transforms/qualifiers.ts` L40-43 — branch: 80%**: The `suffix === undefined` path is unreachable because `SUFFIXES` has 5 elements and the modulo index is always in range. Defensive guard only.
- **`src/tricks/citation.ts` L37, 43 / `src/tricks/footnotes.ts` L37, 44 / `src/tricks/parentheticals.ts` L28 / `src/tricks/repetition.ts` L36-41 / `src/tricks/padding.ts` L46, 70-78, 82-98 (partial)**: Various `=== undefined` guards on array accesses that can never be `undefined` given the modulo arithmetic and non-empty arrays. The remaining uncovered padding lines (L82-98) involve the `phrase === undefined` break inside the while loop — unreachable given `PADDING_PHRASES` is non-empty. Some padding while-loop body lines remain partially uncovered because v8 branch coverage tracks each ternary sub-path independently and the guard-break path is unreachable.
