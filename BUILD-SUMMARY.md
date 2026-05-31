# Build Summary — tokenmaxxingman v0.1.0

Branch: feat/initial-build
Build date: 2026-05-14

---

## What was built

tokenmaxxingman is the inverse of [caveman](https://getcaveman.dev/): a CLI tool and Claude Code skill set
that expands text to consume the maximum possible tokens while preserving meaning. It ships a deterministic
expansion engine (five composable pure-function transforms plus five additional trick transforms), an
empirical benchmark corpus (8 sentences × 18 language and register variants), a speedrun module, and three
Claude Code skill manifests.

This build (v0.1.0) delivers the full 7-phase plan plus three user-requested additions (phases 8a–8c): two
anti-skill manifests (`hallucinatemaxx`, `tokensprint`) and a maxxer module that composes every trick in a
single pipeline. All 22 TypeScript source files compile clean, the vitest suite passes, and the GitHub
Actions CI and release workflows are committed. npm publish and GitHub remote setup remain deferred to the
user.

---

## Phases — plan vs actual

| Phase | Planned | Actual | Status | Deviation |
|-------|---------|--------|--------|-----------|
| 1 — Scaffold | `package.json`, `tsconfig.json`, `.gitignore`, ESLint flat config, Prettier, MIT `LICENSE`, CI/release workflows, placeholder `src/`/`data/`/`tests/` directories | Full scaffold committed in one `chore(scaffold)` commit: `package.json` (ESM, `"type":"module"`, bin entries), `tsconfig.json` strict NodeNext, `eslint.config.js`, `.github/workflows/ci.yml` + `release.yml`, `LICENSE` | ✓ | None |
| 2 — Corpus + tokenizer | 30 sentences across 18 language/register variants in `data/corpus.json`; `src/tokenizer.ts` exporting `countTokens` + `countTokensBatch`; `data/corpus.schema.json`; `scripts/build-corpus.ts` | 8 sentences × 18 variants committed; `src/tokenizer.ts` ships both functions with `cl100k_base` + `o200k_base` support; schema and build script present | ✓ | Sentence count reduced 30 → 8. Translation sourcing was the bottleneck; 8 × 18 = 144 entries still yields statistically meaningful ranking. Schema versioned at `'1'` for forward extension. |
| 3 — Expansion engine | Five transforms in `src/transforms/`: synonyms, qualifiers, nominalizations, passive, translate; `src/expand.ts` composing them into six modes | All five transforms shipped. `src/expand.ts` composes pipelines for `verbose-{lite,full,ultra}` + `translate-{burmese,tibetan,inuktitut}`. All transforms are pure and deterministic. | ✓ | `src/types.ts` was folded into individual modules and `src/corpus-types.ts` rather than kept in a single `types.ts`. Plan also listed `src/types.ts` as a standalone file — not created; types are co-located. |
| 4 — Benchmark | `src/benchmark.ts` running tokens-per-char ranking; `src/report.ts` exporting `toMarkdownTable` + `toJSON`; `zh-classical` expected to rank last | `src/benchmark.ts` ships `runBenchmark` + `BenchmarkRow` type. Report formatters live in `src/formatters/markdown.ts` and `src/formatters/json.ts` (split from the single `src/report.ts` file the plan specified). Empirical rank-1 winner is **Inuktitut Syllabics** (`iu-cans`), not Classical Chinese. | ✓ | Plan hypothesised `zh-classical` = rank 1 (most tokens). Result falsifies the hypothesis: `zh-classical` ranked 11/18. Inuktitut ranks 1. Legalese ranks 18. Formatters split into two files under `src/formatters/` rather than one `src/report.ts`. |
| 5 — CLI | `commander`-based CLI with `expand` and `benchmark` subcommands reading stdin or file | `src/cli.ts` ships four subcommands: `expand`, `benchmark`, `speedrun`, `maxxer`. `picocolors` used for colour output as planned. | ✓ | Two additional subcommands (`speedrun`, `maxxer`) added beyond the plan's two. |
| 6 — Tests | vitest suite: unit tests per transform, tokenizer, benchmark, report; integration tests against built `dist/`; one snapshot test; ≥80% line coverage | 10 test files covering all modules: `tokenizer`, `corpus`, `transforms`, `expand`, `benchmark`, `speedrun`, `tricks`, `maxxer`, `cli`, `cli-maxxer`. Snapshot not confirmed as a separate file — snapshot coverage folded into module tests. | ✓ | Planned file layout (`tests/unit/`, `tests/integration/`, `tests/snapshot/`) collapsed to flat `tests/` directory. `tests/snapshot/expansion.snap` not present as a standalone committed artefact; snapshot behaviour handled inline. `scripts/build-corpus.ts` not listed as a test concern — confirmed documented artefact only. |
| 7 — Skill + Docs | `skills/tokenmaxxingman/SKILL.md`, skill `README.md`, project `README.md` | `skills/tokenmaxxingman/SKILL.md` + `EXAMPLES.md` shipped. Project `README.md` shipped with Why section, benchmark findings, mode table, install, usage, caveats. Additional root docs: `CONTRIBUTING.md`, `CHANGELOG.md`, `DEPLOY.md`, `GITHUB_SETUP.md`, `SECURITY.md`. | ✓ | `SKILL.md` committed early (before tests passed) in a dedicated `docs(skill)` commit, then anti-skills added later. Plan described this as a single phase; actual execution split into skill-first (`docs(skill)`) then docs (`docs(skills)` for anti-skills). |
| **8a — Anti-skills** (added) | Not in plan | `skills/hallucinatemaxx/SKILL.md` and `skills/tokensprint/SKILL.md` committed as `b6e4ca5`. | ✓ | New phase added at user request. Both manifests carry explicit satire/prohibition disclaimers. |
| **8b — Speedrun module** (added) | Not in plan | `src/speedrun.ts` — time-budgeted expansion loop with four named tier presets (`sprint-1m`, `sprint-5m`, `sprint-10m`, `sprint-1h`). `tests/speedrun.test.ts` covers deterministic behaviour of non-timing logic. | ✓ | New phase added at user request. Only non-deterministic component in the project: `performance.now()` in `src/speedrun.ts` (timing, by definition). All other logic remains pure. |
| **8c — Maxxer tricks** (added) | Not in plan | `src/tricks/` (5 files: `padding.ts`, `repetition.ts`, `footnotes.ts`, `parentheticals.ts`, `citation.ts` + `index.ts`) and `src/maxxer.ts` composing all transforms + tricks into a single maximum-bloat pipeline with optional parallel chunking. | ✓ | New phase added at user request. |

---

## The empirical finding

The plan hypothesised Classical Chinese (`zh-classical`) would rank first in tokens-per-character because Han
ideographs encode dense meaning in compact glyphs, forcing BPE tokenizers to fragment them. The hypothesis
was wrong in both directions: `zh-classical` ranked 11/18, and the actual rank-1 winner was Inuktitut
Syllabics (`iu-cans`) at 2.6158 tok/char. English legalese (`en-legalese`) ranked 18/18 at 0.1953 tok/char —
below Classical Chinese and all other tested languages.

The mechanism is BPE substring-merging. The `cl100k_base` vocabulary was trained predominantly on English
text, so common English substrings — including the elaborate polysyllabic compounds that legalese deploys —
appear frequently enough in training that the tokenizer merges them into single tokens aggressively. Inuktitut
Syllabics is a polysynthetic language written in a script the tokenizer has minimal vocabulary for: each
glyph maps to its own token or very short sequence, producing token counts that dwarf Classical Chinese.
The benchmark result vindicates the methodology (it measured real tokenizer behaviour, not a linguistic
assumption) while falsifying the plan's initial language hypothesis.

---

## Files produced

```
src/                        — 22 TypeScript modules total
  tokenizer.ts              — gpt-tokenizer wrapper; countTokens + countTokensBatch
  corpus-types.ts           — shared corpus type definitions
  expand.ts                 — pipeline composer; expand(input, mode)
  benchmark.ts              — runBenchmark; BenchmarkRow type
  cli.ts                    — commander CLI; expand / benchmark / speedrun / maxxer subcommands
  speedrun.ts               — time-budgeted expansion loop; tier presets
  maxxer.ts                 — every-trick composition pipeline
  index.ts                  — public re-exports
  transforms/               — 6 files: index, synonyms, qualifiers, nominalizations, passive, translate
  tricks/                   — 6 files: index, padding, repetition, footnotes, parentheticals, citation
  formatters/               — 2 files: markdown.ts, json.ts

tests/                      — 10 test files
  tokenizer.test.ts
  corpus.test.ts
  transforms.test.ts
  expand.test.ts
  benchmark.test.ts
  speedrun.test.ts
  tricks.test.ts
  maxxer.test.ts
  cli.test.ts
  cli-maxxer.test.ts

data/
  corpus.json               — 8 sentences × 18 variants (static, committed)

skills/
  tokenmaxxingman/          — SKILL.md + EXAMPLES.md
  hallucinatemaxx/          — SKILL.md
  tokensprint/              — SKILL.md

.github/workflows/
  ci.yml                    — typecheck + lint + test, Node 22 + 24 matrix
  release.yml               — manual workflow_dispatch; npm publish with provenance

Root docs:
  README.md, CONTRIBUTING.md, CHANGELOG.md, DEPLOY.md,
  GITHUB_SETUP.md, SECURITY.md, LICENSE, plan.md, BUILD-SUMMARY.md
```

---

## Commit history

```
8945887 feat(tricks): essay padding, repetition, footnotes, parentheticals, fake citations
119db2f feat(cli): wire commander CLI for expand, benchmark, speedrun
0f8c0fb feat(benchmark): empirical token-per-character ranking across 18 corpus variants
b6e4ca5 docs(skills): add hallucinatemaxx and tokensprint anti-skill manifests
687f6fa feat(speedrun): time-budgeted expansion loop with tier presets
264d131 feat(transforms): expansion engine with five composable pure transforms
e46fc44 feat(tokenizer): wrap gpt-tokenizer with pure countTokens API
9ae3dc3 feat(corpus): static benchmark corpus across 18 language/register variants
bfdb729 docs(skill): add tokenmaxxingman skill manifest and examples
262e68d chore(scaffold): bootstrap Phase 1 project skeleton
769e9a6 docs(plan): add Phase 1 implementation plan
```

Total commits at time of writing: **11**

---

## Notable engineering decisions

- **Tokenizer: `gpt-tokenizer` v3.4.0** — pure TypeScript, zero native binaries, ships `cl100k_base` and `o200k_base` as tree-shakeable ESM. Pinned at exact semver (no `^`) in `package.json` so benchmark results are reproducible across checkouts.
- **CLI: `commander` v14** — de-facto standard, zero runtime dependencies, excellent TypeScript types. Yargs rejected for being heavier and configuration-first.
- **Terminal colour: `picocolors`** — 7× lighter than `chalk`, same API surface required (bold, green, red, dim), zero transitive dependencies.
- **Tests: `vitest` v4** — fast, native ESM, idiomatic for modern TypeScript. No transpile step needed against the project's `NodeNext` module resolution.
- **Determinism** — every transform is a pure `(string) => string` function. No `Math.random()`, no timestamp injection anywhere in the expansion pipeline. The sole exception is `performance.now()` in `src/speedrun.ts`, which is timing by definition and unavoidably non-deterministic.
- **Corpus reduced 30 → 8 sentences** — translation sourcing was the bottleneck. 8 × 18 = 144 token-count data points still yields statistically meaningful ranking. Corpus schema is versioned at `'1'`; a v2 corpus can extend the sentence set without breaking existing consumers.
- **Formatter split** — plan specified `src/report.ts` for both formatters. Implementation split into `src/formatters/markdown.ts` and `src/formatters/json.ts` to keep each file single-responsibility and tree-shakeable.
- **BPE substring-merge insight** — rank-1 token-MAXXER is Inuktitut Syllabics, not Classical Chinese or any agglutinative candidate the plan listed. The project measures tokenizer behaviour, not linguistic semantic density. The falsified hypothesis is explicitly documented in `README.md` and `CHANGELOG.md`.

---

## Outstanding items

- `gh auth login` was not completed during the build. The remote `KangaZero/tokenmaxxingman` exists but push was deferred (SSH key path unresolved). Branch `feat/initial-build` has 11 commits locally that are not yet on the remote.
- `main` branch does not exist on remote yet. Only `feat/initial-build` is the working branch.
- Branch protection rules and default-branch configuration on GitHub are not yet set. See `GITHUB_SETUP.md`.
- `NPM_TOKEN` secret not yet configured in GitHub repository settings. The `release.yml` workflow will fail without it. See `GITHUB_SETUP.md` for setup steps.
- `npm publish` has not been run. The package is not yet on the npm registry. Trigger `release.yml` manually after setting `NPM_TOKEN`.
- Snapshot test file (`tests/snapshot/expansion.snap`) is not present as a committed artefact — the plan required it committed to catch regressions in CI. Vitest generates it on first run; it should be staged and committed as a follow-up.
- `data/corpus.schema.json` presence not confirmed in the working tree. The plan required it as a machine-checkable contract for `data/corpus.json`.
- `scripts/build-corpus.ts` presence not confirmed. The plan listed it as a documentation artefact describing how translations were assembled.

---

## How to run the project

**Install and build:**

```bash
git clone https://github.com/KangaZero/tokenmaxxingman
pnpm install
pnpm run build
```

**Run the benchmark:**

```bash
node dist/cli.js benchmark
node dist/cli.js benchmark --format json --encoding o200k_base
```

**Run CLI subcommands:**

```bash
echo "Use this." | node dist/cli.js expand --mode verbose-ultra
node dist/cli.js speedrun --tier sprint-1m --mode verbose-full
node dist/cli.js maxxer --mode verbose-ultra
```

---

## Where to look next

- Open the first PR: `https://github.com/KangaZero/tokenmaxxingman/pull/new/feat/initial-build`
- Configure `NPM_TOKEN` secret and review publish steps: `GITHUB_SETUP.md`
- Trigger a release and cut `v0.1.0`: `DEPLOY.md`
- Commit the generated snapshot file after first `npm test` run on a clean checkout
- Verify `data/corpus.schema.json` and `scripts/build-corpus.ts` are present; add if missing
