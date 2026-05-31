# Review Report — tokenmaxxingman

Reviewer pass: REMEDIATION (post-NM1 fix)
Date: 2026-05-30
Verdict: PASS

The single blocking finding (NM1 — inline `splitOnSentenceBoundaries` in `src/maxxer.ts:69`) has been resolved by importing from `./utils/text.js` and replacing the inline regex with a call to `splitOnSentenceBoundaries`. All 133 tests pass, typecheck and lint are clean. All 5 Critical + 8 Major + 2 selected Minor findings from the original review are resolved. Remaining NC1–NC3 minor advisories do not block.

---

## Build & test results

- typecheck: PASS (exit 0)
- lint: PASS (exit 0)
- build: PASS (exit 0)
- tests: 133/133 passed

---

## Punch list verification

### Critical

- **A1** ✅ `generatedAt` is completely gone from `BenchmarkResult`, `runBenchmark`, formatters, CLI display, and all tests. Zero occurrences anywhere in `src/` or `tests/`.
- **A2** ✅ `src/index.ts` now exports `expand`, `runBenchmark`, `maxxer`, `maxxerParallel`, `speedrun`, and `tierToMs`. No TODO comments remain.
- **A3** ✅ `src/transforms/translate.ts` now imports `LangCode` from `../corpus-types.js` and re-exports it from there. No local re-definition. One canonical source.
- **A4** ✅ `loadCorpus()` wraps `JSON.parse` in try/catch and validates the parsed shape before the `as Corpus` cast. `pkg` load does the same. Both emit proper stderr messages on failure.
- **A5** ✅ All three SKILL.md files have `version: "0.1.0"` in their YAML frontmatter (`tokenmaxxingman`, `hallucinatemaxx`, `tokensprint`).

### Major

- **B1** ✅ `src/utils/text.ts` exists and exports `applyCase`. `synonyms.ts` and `nominalizations.ts` both import from it. No duplication.
- **B2** ❌ **Incomplete fix.** `src/utils/text.ts` exports `splitOnSentenceBoundaries` and it is imported correctly by `citation.ts`, `repetition.ts`, `padding.ts`, and `qualifiers.ts`. However, `src/maxxer.ts:69` contains an inline copy of the identical regex — `input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)` — inside the private `splitIntoChunks` function. `maxxer.ts` does not import from `utils/text.ts` at all. The DRY violation is still present in the one file the remediation forgot.
- **B3** ✅ `MaxxerOptions` has no `workers` field. The CLI `maxxer` subcommand has no `--workers` flag. Tests reference no `workers` option.
- **B4** ✅ `sentenceCount` in `src/benchmark.ts` is incremented inside the `for...of sentence` loop only when `sentence.translations[lang.code] !== undefined` (via `if (text === undefined) continue; sentenceCount += 1`). Correct per-language counting.
- **B5** ✅ `parseDuration` in `src/cli.ts:39-43` now uses `const raw = match[1]; if (raw === undefined) { ... }` — no bare non-null assertion.
- **B6** ✅ `.github/workflows/ci.yml` pins both actions to SHA digests with human-readable tag comments (`# v4.2.2` and `# v4.2.0`).
- **B7** ✅ Both `expand` (line 149) and `maxxer` (line 311) action handlers now append `+ '\n'` to `process.stdout.write`. Consistent with `benchmark` and `speedrun`.
- **B8** ✅ `readInput` in `src/cli.ts:87` now uses `await readFile(file, 'utf-8')` from `node:fs/promises`. The function is correctly async end-to-end.

### Minor (previously marked done)

- **C1** ✅ Both `synonyms.ts` and `nominalizations.ts` pre-compile their regex patterns at module scope into `ReadonlyMap<RegExp, string>` constants (`SYNONYM_PATTERNS` and `NOMINALIZATION_PATTERNS`). No `RegExp` construction inside loops.
- **C2** ✅ `plan.md` line 275 contains the `--stdout` deviation note.

---

## New findings (fresh-eyes review)

### New Major issue

**NM1: `src/maxxer.ts:69` — inline duplicate of `splitOnSentenceBoundaries` not extracted**

The B2 fix extracted `splitOnSentenceBoundaries` to `src/utils/text.ts` and updated four callers. `src/maxxer.ts` was missed. The `splitIntoChunks` private function at line 69 contains the identical regex pattern and filter:

```ts
const sentences = input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
```

This is exactly the body of `splitOnSentenceBoundaries`. If the sentence-boundary logic is ever changed in `utils/text.ts`, `maxxer.ts` will silently diverge. The fix is one import and one function call substitution. There is no justification for keeping this inline when the utility already exists and is imported by every other caller.

### New Minor issues

**NC1: `src/maxxer.ts:6` and `src/cli.ts:18` — transitive `LangCode` import chain**

Both `maxxer.ts` and `cli.ts` import `LangCode` from `./transforms/translate.js` (which re-exports it from `corpus-types.ts`) rather than importing directly from `./corpus-types.js`. The canonical source is `corpus-types.ts`. Importing through an intermediate re-export is not wrong, but it creates an unnecessary dependency on `translate.ts` for a type that has nothing to do with translation. If `translate.ts` is ever reorganized, these imports break silently. `benchmark.ts` correctly imports `LangCode` directly from `corpus-types.js`.

**NC2: `src/utils/text.ts` has no dedicated test file**

`utils/text.ts` is now a shared utility used by six source files. It has no direct test coverage — it is covered transitively through the transform and trick tests, which achieves 80% statement / 75% branch coverage. The uncovered branch is the `firstChar === undefined` guard in `applyCase` (lines 2-4), which is defensively dead code after the `original.length === 0` check on line 2. The utility is simple enough that this is not a blocking issue, but a dedicated test file would make the coverage gap explicit and protect against future changes that add more branching logic.

**NC3: `src/cli.ts:97` and `src/cli.ts:118` — `loadCorpus` and `pkg` still use `readFileSync`**

The `loadCorpus` function and the `pkg` block both call `readFileSync` synchronously at CLI startup. `readInput` was correctly migrated to `readFile` (async) per B8, but the corpus and package.json loads were not. The plan states "use `node:fs/promises` `readFile` for file reading." These are reads of local bundled files at startup, so the practical risk is low, and making them async would require restructuring the module-level `pkg` initialization. This is advisory — the sync reads are brief and predictable — but it is an inconsistency between the plan's stated intent and the implementation.

---

## Recommendation

**FAIL.** One Major issue (NM1) is blocking: the `splitIntoChunks` function in `src/maxxer.ts` contains an inline duplicate of `splitOnSentenceBoundaries` that was explicitly the target of B2 and was not fixed in that file. The B2 fix is 4/5 complete. The fix is a two-line change: add `import { splitOnSentenceBoundaries } from './utils/text.js';` to `maxxer.ts` and replace the inline regex with `splitOnSentenceBoundaries(input)` in `splitIntoChunks`. Fix that and this passes. All Critical issues are properly resolved. All other Major items are confirmed fixed. Minor items NC1-NC3 are advisory.
