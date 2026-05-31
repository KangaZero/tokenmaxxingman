# tokenmaxxingman — implementation plan

**Stack:** TypeScript strict, ESM only, Node >= 22 (target Node 24)
**Scope:** Scaffold + tests + CI workflows (no publish, no live APIs)
**Deploy:** npm bin (`tokenmaxxingman` + `tmm`), local CLI
**Working dir:** `/Users/samuelwaiweng.yong/Documents/tokenmaxxingman/`

---

## Dependency decisions (read before every phase)

### Tokenizer

**Use `gpt-tokenizer` (npm: `gpt-tokenizer`).** Last release: 2025-03 (within 12 months of 2026-05-14). Pure TypeScript, zero native binaries, ships `cl100k_base` and `o200k_base` encodings, tree-shakeable ESM. Ships type declarations natively — no `@types/*` shim needed.

Rejected alternatives:
- `tiktoken` — Rust/WASM build; binary dependency, harder to pin deterministically in CI.
- `@anthropic-ai/tokenizer` — no public npm package under this exact name as of 2026-05-14; Anthropic embeds token counting in the SDK behind an API call, not a local library.
- `js-tiktoken` — valid fallback but `gpt-tokenizer` is lighter and equally maintained.

**Model target:** `cl100k_base` (GPT-4 / Claude approximation). The benchmark will also run `o200k_base` as a secondary column so results are tokenizer-family-agnostic.

### CLI framework

**Use `commander` (npm: `commander`).** Last release: 2025-11 (v13). De-facto standard, minimal, zero dependencies, excellent TypeScript types. Yargs is heavier and configuration-first; hand-rolling wastes time.

### Terminal colour

**Use `picocolors` (npm: `picocolors`).** Last release: 2025-01. 7x lighter than `chalk`, same API surface needed here (bold, green, red, dim). Zero dependencies.

### No other runtime dependencies.

All expansion transforms are pure TS functions over static data. The benchmark corpus is a bundled JSON file; no translation API is called at runtime.

---

## Corpus assembly note

`data/corpus.json` is a hand-assembled, statically committed file. A companion `scripts/build-corpus.ts` documents *how* the translations were gathered (human translators / reference grammars / community corpora — no runtime API calls). The script is a documentation artefact; it is never required to run to use the tool. This makes benchmark results fully reproducible: lock `gpt-tokenizer` at a pinned semver in `package-lock.json`, commit `data/corpus.json`, done.

---

## Mode naming convention

Caveman's axis is *compression intensity*. tokenmaxxingman's axis is *verbosity intensity × language maximization*.

| Mode | Inverse of | Description |
|---|---|---|
| `verbose-lite` | `lite` | Remove contractions, restore filler, add soft hedges |
| `verbose-full` | `full` (default) | Full synonym inflation, qualifiers, throat-clearing |
| `verbose-ultra` | `ultra` | Maximum English bloat: legalese, nominalizations, passive voice, embedded clauses |
| `<lang>-lite` | `wenyan-lite` | Translate to benchmark-winner language, low density |
| `<lang>-full` | `wenyan-full` | Translate to benchmark-winner language, full form |
| `<lang>-ultra` | `wenyan-ultra` | Benchmark-winner language, maximum morphological inflation |

`<lang>` is resolved after the benchmark runs. The slot is named `burmese` in the implementation as the most likely winner based on known BPE tokenizer behaviour against Burmese script, but the SKILL.md and CLI accept any language key present in the corpus. The documenter fills the confirmed winner in after tests pass.

---

## Phase 1 — Project scaffold

**Goal:** Establish every config file so every subsequent phase has a working, type-checkable, lint-clean foundation with zero production logic yet.

**Files:**
- `package.json`
- `tsconfig.json`
- `.gitignore`
- `.npmignore`
- `eslint.config.js`
- `.prettierrc`
- `LICENSE`
- `src/.keep` (empty placeholder so the directory is tracked)
- `data/.keep`
- `tests/.keep`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

**Acceptance:** Running `npm ci && npm run typecheck && npm run lint` exits 0 on a clean checkout with no source files yet (typecheck passes against an empty `src/` because `noEmit: true` and no files to reject).

**Notes:**
- `package.json` must declare `"type": "module"` (ESM). `main` points to `dist/index.js`. `bin` entries: `"tokenmaxxingman": "./dist/cli.js"` and `"tmm": "./dist/cli.js"`.
- `tsconfig.json`: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"target": "ES2022"`, `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`. No `any` in `compilerOptions` overrides.
- ESLint flat config (`eslint.config.js`) must use `@eslint/js` + `typescript-eslint` v8 flat config API. Rule `@typescript-eslint/no-explicit-any: error`.
- `.prettierrc`: `"singleQuote": true`, `"trailingComma": "all"`, `"semi": true`, `"printWidth": 100`.
- `ci.yml`: triggers on `push` and `pull_request`, runs `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`. Node version matrix: `[22, 24]`.
- `release.yml`: triggers on `workflow_dispatch` only (not auto on tag push — user runs manually). Steps: checkout, setup-node with `registry-url`, `npm ci`, `npm run build`, `npm publish`. Include a `TODO` comment explaining the user must set `NPM_TOKEN` secret.
- `LICENSE`: MIT, copyright Samuel Waiweng Yong, 2026.

---

## Phase 2 — Static corpus + tokenizer wrapper

**Goal:** Commit the benchmark corpus JSON and a thin deterministic tokenizer wrapper so the benchmark and tests have a stable data layer.

**Files:**
- `data/corpus.json`
- `data/corpus.schema.json` (JSON Schema for corpus — machine-checkable contract)
- `scripts/build-corpus.ts` (documentation script; not run in CI)
- `src/tokenizer.ts`

**Acceptance:** `import { countTokens } from './tokenizer.js'` in a vitest test returns a `number > 0` for the string `"hello world"` under both `cl100k_base` and `o200k_base` encodings, and `npm test` exits 0 for that unit test.

**Notes:**

Corpus shape (`corpus.schema.json` governs this):
```
{
  "sentences": [
    {
      "id": "s001",
      "en": "The quick brown fox jumps over the lazy dog.",
      "translations": {
        "my": "...",   // Burmese (Myanmar script)
        "bo": "...",   // Tibetan
        "km": "...",   // Khmer
        "am": "...",   // Amharic
        "te": "...",   // Telugu
        "ta": "...",   // Tamil
        "ml": "...",   // Malayalam
        "si": "...",   // Sinhala
        "ka": "...",   // Georgian
        "iu": "...",   // Inuktitut syllabics
        "chr": "...",  // Cherokee
        "fi": "...",   // Finnish
        "hu": "...",   // Hungarian
        "tr": "...",   // Turkish
        "legalese": "...",   // verbose English register
        "victorian": "...",  // verbose English register
        "academic": "...",   // verbose English register
        "corporate": "...",  // verbose English register
        "zh-classical": "..." // Classical Chinese (caveman champion — baseline last)
      }
    }
  ]
}
```

Minimum 20 sentences, targeting 30. Sentences chosen for semantic richness and varying clause complexity so tokens-per-meaning is a meaningful ratio, not just a length artefact.

`src/tokenizer.ts` exports:
```ts
export type Encoding = 'cl100k_base' | 'o200k_base';
export function countTokens(text: string, encoding?: Encoding): number;
export function countTokensBatch(texts: string[], encoding?: Encoding): number[];
```

Both functions are pure and synchronous. `gpt-tokenizer` is the sole runtime dependency here.

---

## Phase 3 — Expansion engine

**Goal:** Implement all composable text-expansion transforms as pure functions, covering the five strategies: synonym inflation, qualifier injection, nominalization, passive-voice wrapping, and a scripted translation stub.

**Files:**
- `src/transforms/synonyms.ts`
- `src/transforms/qualifiers.ts`
- `src/transforms/nominalizations.ts`
- `src/transforms/passive.ts`
- `src/transforms/translate.ts`
- `src/transforms/index.ts`
- `src/expand.ts`
- `src/types.ts`

**Acceptance:** `npm test -- --reporter=verbose` passes all unit tests for transforms (each transform file has a co-located `tests/unit/transforms/*.test.ts`). Given the input `"Use this to help."`, `expand("Use this to help.", 'verbose-ultra')` returns a string whose `countTokens` result is measurably higher than the input's token count.

**Notes:**

`src/types.ts` defines all shared types:
```ts
export type Mode =
  | 'verbose-lite'
  | 'verbose-full'
  | 'verbose-ultra'
  | `${string}-lite`
  | `${string}-full`
  | `${string}-ultra`;

export type Transform = (input: string) => string;
export type TransformPipeline = Transform[];
```

Transform contracts — all functions are `(input: string) => string`, pure, no side effects, no I/O:

- `synonyms.ts`: word-boundary regex replacement from a static `Map<string, string[]>` lookup table. On `verbose-lite`, replace with the first (mildest) synonym. On `verbose-ultra`, use the longest available form. At minimum cover: use→utilize/employ/leverage, help→facilitate/provide assistance to, fix→remediate, start→commence/initiate, end→conclude/terminate, show→demonstrate/illustrate, need→necessitate/require, big→substantial/considerable, small→diminutive/negligible. No external NLP library — static lookup is sufficient and deterministic.

- `qualifiers.ts`: sentence-prefix/suffix injection from a static pool. Lite: 1 qualifier per paragraph. Ultra: every sentence gets a prefix and a suffix. Example prefixes: `"It is, of course, important to note that"`, `"One must acknowledge, with due consideration, that"`. Deterministic: cycle through the pool by sentence index (no `Math.random()`).

- `nominalizations.ts`: verb→noun phrase conversion. `"We decided"` → `"A decision was reached by the relevant parties"`. Static lookup table. Scope to ~30 high-frequency verbs.

- `passive.ts`: active→passive heuristic. Identify simple SVO patterns (regex-based, not full NLP parse — document this limitation). `"The team built the feature"` → `"The feature was built by the team"`. Only fires on patterns it can match with confidence; leaves unmatched sentences unchanged.

- `translate.ts`: given a language key and a sentence, look up the pre-translated string from the corpus. Returns the translation if found, otherwise returns the input unchanged (no API call ever). Exported as `translateFromCorpus(sentence: string, langKey: string, corpus: Corpus): string`.

`src/expand.ts` composes transforms into a pipeline based on mode:
- `verbose-lite`: synonyms (mild) → qualifiers (sparse)
- `verbose-full`: synonyms (full) → qualifiers (moderate) → nominalizations
- `verbose-ultra`: synonyms (ultra) → qualifiers (dense) → nominalizations → passive
- `<lang>-*`: translate (from corpus, if found) → apply verbose pipeline at the corresponding intensity

The `expand` function signature:
```ts
export function expand(input: string, mode?: Mode): string;
```

**Determinism requirement:** `expand` is fully deterministic. No `Math.random()`, no timestamp injection. Same input + mode = same output, forever. This is non-negotiable for snapshot tests.

**Encoding trick caveat:** Zero-width joiners and combining diacritics were considered as a token-inflation trick. They must NOT be included unless the implementer empirically verifies via `countTokens` that they produce additional tokens (not zero-cost invisible characters). If verified, add as an optional `unicode-tricks.ts` transform gated behind a `--unicode-tricks` CLI flag and clearly documented as a hack. Default: off.

---

## Phase 4 — Benchmark module

**Goal:** Implement the empirical ranking study that reads the static corpus, tokenizes every language variant, and outputs a ranked markdown table and/or JSON report.

**Files:**
- `src/benchmark.ts`
- `src/report.ts`

**Acceptance:** `node --experimental-vm-modules dist/benchmark.js` (or via `tmm benchmark`) exits 0, prints a markdown table to stdout with at minimum 14 language rows, and the row for `zh-classical` ranks last (fewest tokens/char), confirming the inverse relationship with caveman.

**Notes:**

`src/benchmark.ts` exports:
```ts
export type BenchmarkRow = {
  langKey: string;
  langLabel: string;
  totalTokensCl100k: number;
  totalTokensO200k: number;
  totalChars: number;
  totalSentences: number;
  tokensPerChar: number;
  tokensPerSentence: number;
  rank: number; // 1 = most tokens (winner), N = fewest (caveman baseline last)
};

export function runBenchmark(corpus: Corpus, encoding?: Encoding): BenchmarkRow[];
```

Metrics computed per language across the full corpus:
1. `tokens / char` — primary sort key (higher = more token-dense)
2. `tokens / sentence` — secondary column (raw volume)

`src/report.ts` exports two formatters:
```ts
export function toMarkdownTable(rows: BenchmarkRow[]): string;
export function toJSON(rows: BenchmarkRow[]): string; // JSON.stringify with 2-space indent
```

Both formatters are pure functions (input: rows → output: string). No file I/O inside them.

The benchmark result is deterministic because:
1. Corpus is static JSON committed to the repo.
2. `gpt-tokenizer` version is pinned in `package-lock.json`.
3. Sort is stable (tie-break by `langKey` alphabetically).

---

## Phase 5 — CLI

**Goal:** Wire up the `commander`-based CLI that exposes `expand` and `benchmark` subcommands, reads stdin or a file argument, and routes output to stdout.

**Files:**
- `src/cli.ts`

**Acceptance:** After `npm run build`, running `./node_modules/.bin/tmm --version` prints the version from `package.json`; `echo "Use this." | ./node_modules/.bin/tmm expand --mode verbose-ultra` prints a longer string to stdout; `./node_modules/.bin/tmm benchmark --format json` prints valid JSON with a `"rows"` array.

**Notes:**

CLI surface:
```
tokenmaxxingman expand [file]       # file or stdin if omitted
  --mode <mode>                     # default: verbose-full
  # Deviation: --stdout flag dropped — stdout is the default sink.

tokenmaxxingman benchmark
  --format <markdown|json>          # default: markdown
  --encoding <cl100k_base|o200k_base>  # default: cl100k_base

tokenmaxxingman --version
tokenmaxxingman --help
```

`src/cli.ts` is the sole file with side effects (`process.stdin`, `process.stdout`, `process.exit`). All logic is imported from `src/expand.ts`, `src/benchmark.ts`, `src/report.ts`. Keep cli.ts thin — it is an integration point only, not a logic layer.

File reading: use `node:fs/promises` `readFile`. Stdin reading: collect chunks from `process.stdin` with `async iterator` (`for await (const chunk of process.stdin)`). No third-party stream helpers.

Error handling: all user-facing errors print to `process.stderr` and exit with code 1. Never throw unhandled.

---

## Phase 6 — Tests

**Goal:** Full vitest test suite covering units, integration, and a snapshot regression.

**Files:**
- `tests/unit/transforms/synonyms.test.ts`
- `tests/unit/transforms/qualifiers.test.ts`
- `tests/unit/transforms/nominalizations.test.ts`
- `tests/unit/transforms/passive.test.ts`
- `tests/unit/transforms/translate.test.ts`
- `tests/unit/tokenizer.test.ts`
- `tests/unit/benchmark.test.ts`
- `tests/unit/report.test.ts`
- `tests/integration/cli-expand.test.ts`
- `tests/integration/cli-benchmark.test.ts`
- `tests/snapshot/expansion.test.ts`
- `tests/snapshot/snapshots/expansion.snap` (auto-generated by vitest on first run)

**Acceptance:** `npm test` exits 0. `npm test -- --coverage` shows ≥ 80% line coverage across `src/`. The snapshot test fails if `expand("The quick fox.", 'verbose-ultra')` output changes without an explicit `--update-snapshots` flag.

**Notes:**

Unit tests for each transform follow the pattern: given known input → assert known output. No mocking needed because all transforms are pure functions.

Integration tests for the CLI spawn the built binary using `node:child_process` `execFile` (or vitest's `execa` if the implementer prefers — `execa` v9 is ESM-native and actively maintained, last release 2025-08; it is an acceptable optional dev dependency for integration tests only). Tests must run against `dist/` (built output), so `npm run build` must be a `pretest` step or the tests check for `dist/` and skip with a clear message if missing.

Benchmark determinism test: run `runBenchmark(corpus)` twice in the same test, assert `JSON.stringify(result1) === JSON.stringify(result2)`. Also assert `zh-classical` has the lowest `tokensPerChar` rank (rank === rows.length).

Snapshot test: uses `expect(output).toMatchSnapshot()`. The snapshot file is committed so CI catches regressions.

---

## Phase 7 — Skill + Docs

**Goal:** Write the Claude Code skill file and the README so the project is fully usable and the joke lands correctly.

**Files:**
- `skills/tokenmaxxingman/SKILL.md`
- `skills/tokenmaxxingman/README.md`
- `README.md`

**Acceptance:** `SKILL.md` has a valid YAML frontmatter block with `name`, `description`, and `version` fields. `README.md` opens with the WHY (mental model) before the install instructions. A human reviewer confirms the joke lands (caveman contrast is explicit; the absurdity is acknowledged; the engineering rigour is real).

**Notes:**

`skills/tokenmaxxingman/SKILL.md` frontmatter:
```yaml
---
name: tokenmaxxingman
description: >
  Maximum-token communication mode. Expands every response to use the most tokens possible
  while preserving full meaning. The inverse of caveman. Intensity levels: verbose-lite,
  verbose-full (default), verbose-ultra, plus language-maximizer modes targeting the
  empirically highest-token-density natural language.
  Use when user says "tokenmaxxingman mode", "use tmm", "maximize tokens", or invokes
  /tokenmaxxingman.
---
```

Mode table (mirror of caveman's intensity table):

| Level | What changes |
|---|---|
| `verbose-lite` | Expand contractions, restore dropped articles, add soft hedges |
| `verbose-full` | Synonym inflation, qualifiers, nominalizations. Classic bureaucratic prose |
| `verbose-ultra` | Full legalese: passive voice, embedded subordinate clauses, maximum nominalization |
| `<lang>-lite` | Translate to benchmark-winner language, standard register |
| `<lang>-full` | Benchmark-winner language, full morphological expansion |
| `<lang>-ultra` | Benchmark-winner language with maximum agglutinative inflation |

Auto-deflate rule (inverse of caveman's auto-clarity): tokenmaxxingman drops to normal prose for code blocks (never expand code), error messages (quote exact), and irreversible action confirmations (clarity > verbosity). Mirrors caveman's boundary rules exactly, inversely.

Persistence: active every response until `"stop tmm"` / `"normal mode"`.

`README.md` structure:
1. **Why this exists** (mental model: caveman minimizes, tokenmaxxingman maximizes; together they bracket the token-space of human language; this is also a joke)
2. The benchmark methodology (what the corpus is, what tokenizer, what metric, honesty about tokens-per-meaning being a fuzzy proxy and why sentences-as-units is the chosen approximation)
3. Ranked results table (placeholder — documenter leaves a `<!-- TODO: fill after running npm run benchmark -->` comment; benchmark output is designed to be pasted directly)
4. Install + usage
5. Mode reference table
6. Honest disclaimer section titled "Why tokens-per-meaning is fuzzy" explaining: script complexity, BPE vocabulary coverage, and morphological density are distinct phenomena that all push token counts up but measure different things

The README must not contain marketing fluff. Lead with the joke. Explain the engineering. Keep it dry.

---

## Risks

- **Tokenizer version drift:** If `gpt-tokenizer` releases a new version that changes tokenization of non-Latin scripts (BPE vocab updates), benchmark results will silently shift. Mitigation: pin exact semver in `package.json` (`"gpt-tokenizer": "x.y.z"` not `"^x.y.z"`), commit `package-lock.json`, and document in README that results are tokenizer-version-specific.

- **Corpus translation quality:** The pre-translated sentences in `data/corpus.json` are assembled by the implementer using reference sources (not a live API). Low-quality translations may produce unrealistic token counts for some languages. Mitigation: `scripts/build-corpus.ts` documents each translation's source; reviewer phase should spot-check at least 3 languages. Flag in README.

- **Passive/nominalization transforms are heuristic:** The regex-based passive and nominalization transforms will fail on complex sentence structures (relative clauses, compound sentences, inverted syntax). They are best-effort, not a full NLP parse. This is acceptable for the joke use case and must be documented in source comments and README. Do NOT silently mangle text — the transforms must leave unmatched sentences unchanged.

- **`<lang>-*` modes depend on corpus coverage:** If a user invokes `burmese-ultra` on a sentence not in the corpus, `translateFromCorpus` returns the original English. This degrades gracefully but limits real-world usefulness. Mitigation: document explicitly in SKILL.md and CLI `--help`. The benchmark modes are demonstrations, not production translation tools.

- **7-phase limit reached:** This plan is at maximum phases. If the corpus assembly (Phase 2 notes) turns out to require its own phase (e.g. translations are found to need validation scripts), split Phase 2 into 2a (scaffold corpus schema + tokenizer wrapper) and 2b (corpus data), and merge Phase 6 snapshot tests into Phase 5 to stay under 7. Flag this to orchestrator before starting Phase 2.

---

## Out of scope

- Pushing to GitHub (user's `gh auth` not working; `release.yml` is written but not triggered).
- Publishing to npm.
- Live translation API calls at runtime.
- Full NLP parsing (spaCy, compromise.js, etc.) — heuristic regex transforms only.
- Support for agent targets other than Claude Code (no Gemini/Cursor/Windsurf variants planned).
- A `tokenmaxxingman-compress` inverse skill (compressing tokenmaxxingman output back to English) — this would be circular and is explicitly not planned.
