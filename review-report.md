# Review Report — tokenmaxxingman

Reviewer pass: PRELIMINARY
Date: 2026-05-14T00:00:00Z
Verdict: FAIL

---

## Build & test results

- typecheck: exit 0
- lint: exit 0
- build: exit 0
- tests: 111/111 passed

---

## Findings (severity-sorted)

### Critical (must fix before deploy)

1. `src/benchmark.ts:79` — `new Date().toISOString()` inside `runBenchmark` injects a wall-clock timestamp into `BenchmarkResult.generatedAt`. The plan declares `runBenchmark` to be a pure, deterministic function. It is not. Every call returns a structurally different object. The benchmark determinism test (`tests/benchmark.test.ts:54`) strips `generatedAt` before comparing, which means it silently papers over the violation rather than fixing it. **Fix:** remove `generatedAt` from the return value of `runBenchmark`; if a timestamp is needed for display, generate it in the formatter or the CLI call-site.

2. `src/index.ts:3–4` — Two stale `TODO` comments that were never resolved: `// TODO: Phase 3 — export expand from ./expand.js` and `// TODO: Phase 4 — export runBenchmark from ./benchmark.js`. Both modules are complete and shipped. The public entry-point (`dist/index.js`) does not export `expand` or `runBenchmark`, making the published package's surface useless as a library. Any consumer doing `import { expand } from 'tokenmaxxingman'` gets nothing. **Fix:** replace both TODO comments with the actual exports.

3. `src/transforms/translate.ts:6` — `LangCode` is re-exported as `export type LangCode = string` — a naked `string` alias — which already exists identically at `src/corpus-types.ts:1`. Two different modules export the same type under the same name with the same definition. `src/maxxer.ts:6` imports from `translate.ts` and re-exports it; `src/corpus-types.ts` exports it for the corpus layer. When downstream code uses both, it gets two structurally identical but nominally distinct types. If the definition ever diverges the compiler will not catch it. **Fix:** delete the definition in `translate.ts`, import and re-export `LangCode` from `corpus-types.ts` in the one place that needs it.

4. `src/cli.ts:86` and `src/cli.ts:91` — `JSON.parse(readFileSync(...)) as Corpus` and `JSON.parse(readFileSync(...)) as { version: string }` are unsound `as`-casts on arbitrary file I/O. If the corpus file or `package.json` is malformed, the cast silently succeeds and the program crashes with an unreadable runtime error downstream instead of a clear user-facing message. The plan explicitly requires all user-facing errors to print to stderr and exit 1. **Fix:** validate the parsed object before casting, or catch the parse error and emit a proper error message.

5. All three SKILL.md files missing the `version` field in YAML frontmatter. The plan (Phase 7) explicitly requires `name`, `description`, **and** `version` fields. All three files have `name` and `description` but no `version`. A YAML-strict consumer of these files will fail the schema check. **Fix:** add `version: "0.1.0"` to the frontmatter of `skills/tokenmaxxingman/SKILL.md`, `skills/hallucinatemaxx/SKILL.md`, and `skills/tokensprint/SKILL.md`.

---

### Major (fix before deploy)

1. `src/transforms/synonyms.ts:65–73` and `src/transforms/nominalizations.ts:34–42` — `applyCase` is copy-pasted verbatim between two files — identical function name, identical body, identical logic. This is a textbook DRY violation. **Fix:** extract to a shared utility, e.g., `src/utils/text.ts`, and import in both.

2. `src/tricks/citation.ts:29`, `src/tricks/repetition.ts:17`, `src/tricks/padding.ts:40` — `splitOnSentenceBoundaries` is copy-pasted across three separate trick modules with identical bodies (`input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)`). `src/transforms/qualifiers.ts:27` has the same logic under the name `splitSentences`. Four near-identical functions doing the same thing, zero shared utility. **Fix:** extract to `src/utils/text.ts` alongside `applyCase`.

3. `src/maxxer.ts:19` — `workers` option is a cosmetic lie. `MaxxerOptions` accepts a `workers` field and it is validated and documented in both the source and the CLI. The comment at line 88–89 admits it is not actually parallel: `"A future worker_threads upgrade can replace the inner maxxer call with a worker message."` Accepting a `workers` parameter with defined bounds (1–8) and clamping logic when it does nothing except determine chunk count for a sequential `Promise.all` of synchronous CPU-bound work is misleading to callers. **Fix:** either remove the `workers` option entirely until it is real, or at minimum document it prominently as a no-op performance-wise and remove the MAX_WORKERS constant until the feature exists.

4. `src/benchmark.ts:41` — `sentenceCount` is assigned `corpus.sentences.length` (total sentences in corpus) rather than the count of sentences that actually had a translation for the current language. For a language with incomplete coverage, `tokensPerSentence` is calculated against the wrong denominator. Since `data/corpus.json` is complete for all 18 languages this doesn't bite at runtime, but it is semantically incorrect and will silently produce wrong results if the corpus is ever extended with partial translations. **Fix:** count only sentences where `sentence.translations[lang.code] !== undefined`.

5. `src/cli.ts:38` — `parseDuration` uses a non-null assertion (`match[1]!`) on a regex capture group. With `noUncheckedIndexedAccess` enabled in tsconfig, the compiler doesn't flag this because `!` suppresses the check. The regex guarantees the group exists when the match succeeds, but the pattern `(\d+(?:\.\d+)?)` is in group 1, not group 0, so if the regex is ever modified, this silently breaks. **Fix:** use a proper guard: `const raw = match[1]; if (raw === undefined) { ... }`.

6. `.github/workflows/ci.yml` — Action versions are pinned to floating major tags (`actions/checkout@v4`, `actions/setup-node@v4`), not to commit SHAs. The supply-chain security standard for CI is SHA pinning (e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`). A compromised `v4` tag will silently execute arbitrary code in the CI context. **Fix:** pin both actions to their SHA digests and add a comment with the human-readable tag.

7. `src/cli.ts:111` and `src/cli.ts:277` — The `expand` and `maxxer` subcommands write output with `process.stdout.write(output)` — no trailing newline. Every other subcommand (`benchmark`, `speedrun`) appends `\n`. This inconsistency means `echo "Use this." | tmm expand` results in the shell prompt appearing on the same line as the output, which is visibly broken. **Fix:** append `+ '\n'` to both `stdout.write(output)` calls in the `expand` and `maxxer` action handlers.

8. `src/cli.ts:72-79` — `readInput` is `async` but falls back to `readFileSync` for the file path (line 78). The function signature advertises async but the file branch is synchronous and blocks the event loop. This is an inconsistency in contract. The plan explicitly specifies using `node:fs/promises` `readFile` for file reading. **Fix:** replace `readFileSync(file, 'utf-8')` with `await readFile(file, 'utf-8')` using the promises API.

---

### Minor (nice-to-have)

1. `data/corpus.schema.json` — Missing entirely. The plan (Phase 2) requires a JSON Schema file as a machine-checkable contract for corpus shape. The corpus validation in `tests/corpus.test.ts` is hand-rolled TypeScript, not driven by the schema file. Without the schema file, any tooling that validates or documents the corpus format has nothing to point to.

2. `src/index.ts` — The public library entry-point exports only `countTokens`, `EncodingName`, and `TokenCount`. Neither `expand`, `runBenchmark`, `maxxer`, nor any transform is exported. If someone installs this as a library they get a tokenizer wrapper and nothing else. This is clearly an artefact of the stale TODO comments (see Critical #2), but worth calling out explicitly.

3. Plan spec says `tests/unit/transforms/*.test.ts` and `tests/integration/cli-*.test.ts` in a structured directory layout. Actual test structure is a flat `tests/*.test.ts`. The plan's Phase 6 acceptance criteria reference specific file paths that do not exist. This is not a runtime issue (vitest finds them fine via the glob in `vitest.config.ts`) but breaks any documentation or tooling that references the spec paths.

4. Plan spec says corpus should have "minimum 20 sentences, targeting 30". Actual corpus has 8 sentences. The `corpus.test.ts` asserts `toHaveLength(8)` — meaning the test was written to match the implementation rather than the plan. The README honestly reports 8 sentences. This is a deliberate divergence but undocumented in the plan.

5. `tests/benchmark.test.ts:13` — Module-level `const corpus = JSON.parse(readFileSync(corpusPath, 'utf-8')) as Corpus` is an unsound `as`-cast on file I/O at module load time. Same problem as the cli.ts load-time cast (Critical #4), though in a test file with less user-visible impact.

6. `src/transforms/synonyms.ts:80` — New `RegExp` objects are constructed inside a `for...of` loop on every call to `synonyms()`. With 62 entries in the map, this creates 62 `RegExp` objects per `synonyms()` call. All of them could be pre-compiled at module load time since the patterns are static. Same issue in `src/transforms/nominalizations.ts:47`. **Fix:** pre-compile the patterns into a `ReadonlyMap<RegExp, string>` at module scope.

7. `src/maxxer.ts` — `maxxerParallel` is exported and tested. The `workers` option controls chunk count. Workers > 8 is clamped to 8. However, the clamping test in `tests/maxxer.test.ts:77` asserts `maxxerParallel(LONGER_INPUT, { workers: 99 })` equals `maxxerParallel(LONGER_INPUT, { workers: 8 })`. This is only true if splitting into 8 vs 99 chunks produces identical output, which depends on the sentence-boundary splitter producing the same chunks. The test asserts equality but the chunking logic could differ between 8 and 99 if `Math.ceil(sentences.length / chunkCount)` produces different groupings. This test is coincidentally correct for the specific input but is fragile.

8. `src/tricks/padding.ts:65` — `opts` is typed as `Partial<PaddingOptions>` but `PaddingOptions` only has one field. A `Partial` of a single-field interface is just `{ targetMultiplier?: number }`. Using `Partial<PaddingOptions>` is unnecessarily abstract for what is effectively one optional number. Minor, but `opts?: { targetMultiplier?: number }` or making `targetMultiplier` optional in the interface is cleaner.

9. Plan Phase 6 specifies a snapshot test file `tests/snapshot/expansion.test.ts`. No snapshot test of `expand()` output exists. The only snapshot is an inline snapshot in `tests/maxxer.test.ts:60` testing `maxxer()`, not `expand()`. The plan's acceptance criterion for snapshot regression on `expand("The quick fox.", 'verbose-ultra')` is uncovered.

10. `README.md:93` — The `--stdout` flag is listed in the plan's CLI surface spec (`tokenmaxxingman expand [file] --stdout`) and mentioned as "always (default); kept for explicitness." The CLI does not implement this flag. The README Usage section does not mention it. If the plan intended it to exist, it's unimplemented. If it was intentionally dropped, the plan should have noted the deviation.

---

### Style / nits (optional)

1. `src/transforms/synonyms.ts:14–15` — Synonym values like `'prior to the temporally antecedent moment of'` and `'subsequent to the temporally posterior instance of'` for `before` and `after` are so long they will break any sentence containing those words in a structurally dependent position. This is a feature for the joke, but the substitution also changes grammatical category (preposition → prepositional phrase), which may corrupt the passive transform's SVO matcher downstream. Intentional but worth flagging.

2. `src/benchmark.ts` — `BenchmarkResult` and `BenchmarkRow` are defined here but the plan spec says they should live in a separate `src/report.ts`. The formatters live in `src/formatters/`. Having both the data model and the computation in one file is fine, but `src/report.ts` is entirely absent — all report-related exports were folded into `src/formatters/json.ts` and `src/formatters/markdown.ts` instead. The plan also specified `toMarkdownTable` and `toJSON` as export names; the implementations use `toMarkdown` and `toJson`.

3. `src/transforms/qualifiers.ts:38` — `if (index % 2 === 0)` with a comment "even-indexed sentences get a prefix". This means only half of sentences are qualified, which is consistent with the plan's "Lite: 1 qualifier per paragraph" spec — but the mode-routing in `expand.ts` uses the same `qualifiers()` function for both `verbose-full` and `verbose-ultra` without differentiation. The plan specifies "every sentence gets a prefix and a suffix" at ultra. The transform doesn't implement distinct lite/full/ultra densities — it always runs at lite density regardless of mode. This is a missing feature masked as a working feature.

4. `src/maxxer.ts:22` — `MEMORY_BUDGET_BYTES` uses underscores for readability (`1_048_576`), which is good, but `OUTPUT_CAP = 4096` in `src/speedrun.ts:38` is a plain magic number without a named unit or comment indicating why 4096 specifically. The benchmark reviewer will ask.

5. `.github/workflows/ci.yml` — No `npm run build` step in CI. The test suite internally runs `npm run build` inside `beforeAll` in `cli.test.ts`, which works — but it means CI will run a redundant build step that is not visible in the workflow steps list. A developer reading `ci.yml` cannot tell from the YAML that a build occurs during test. Add an explicit `npm run build` step between lint and test for transparency.

---

## Things done well (brief — at most 5 bullets)

- Type discipline is genuinely strong. `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, and `noFallthroughCasesInSwitch` are all enabled and the code handles the resulting undefined-access checks correctly throughout. No `any` anywhere in the source.
- Determinism is properly enforced across all non-timing modules. `Math.random()` is absent. `performance.now()` is correctly isolated to `speedrun.ts` with a justifying comment. The benchmark determinism test is correctly structured to strip the non-deterministic `generatedAt` field before comparison (even though that field shouldn't exist — see Critical #1).
- The `synonyms.ts` and `passive.ts` transforms correctly implement `applyCase` to preserve capitalisation on sentence-initial words, avoiding the common mistake of lowercasing every replacement.
- The CLI error handling pattern is consistent: every failure path calls `console.error` to stderr and `process.exit` with the appropriate code. Exit code 2 for usage errors vs 1 for runtime errors is correct POSIX practice.
- The `citation.ts` satire notice at the top of the file is the right call. Any satirical module generating fake academic output must prominently document what it is to prevent misuse.

---

## Recommendation

This codebase is close to shippable but has two blockers that make the FAIL verdict non-negotiable. First, `runBenchmark` mutates the result with a wall-clock timestamp, making it non-deterministic in direct contradiction of the stated design contract and the plan's explicit requirement. Second, the public library entry-point exports nothing useful — any library consumer gets a tokenizer wrapper and nothing else, because two Phase 3/4 TODOs were never resolved. Fix those two, address the DRY violations (the copy-pasted `applyCase` and `splitOnSentenceBoundaries` functions are embarrassing for a codebase this otherwise careful), add the trailing newline to the `expand` and `maxxer` stdout writes, and this passes. The `workers` cosmetic lie should be removed or clearly marked as a no-op until the worker_threads implementation exists. SKILL.md files need the `version` field. Everything else is advisory.
