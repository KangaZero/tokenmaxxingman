# Build Summary — the initial build

**Status: historical.** This document records the initial seven-phase build, as
executed on the date below. That build was drafted against an unreleased `0.1.0`
version number and ultimately shipped as **`0.0.1`**; the `0.1.0` number was
later spent on the MCP server release. The heading has been corrected
accordingly. Everything below the horizontal rule is the contemporaneous record
and is deliberately not rewritten — a build summary that is quietly edited to
match the present is no longer evidence of anything.

For what the project looks like now, read the section **"What has shipped since
this build"** at the end, then `CHANGELOG.md`.

Branch: `feat/initial-build` (long since merged and deleted; `main` is the
default branch)
Build date: 2026-05-14
Released as: `0.0.1`, 2026-05-31

---

## What was built

tokenmaxxingman is a deliberately maximalist token-expenditure toolkit: a CLI tool and Claude Code skill set
that expands text to consume the maximum possible tokens while preserving meaning. Its reference point is the
token floor of plain prose, which the bundled benchmark measures directly. It ships a deterministic
expansion engine (five composable pure-function transforms plus five additional trick transforms), an
empirical benchmark corpus (8 sentences × 18 language and register variants), a speedrun module, and three
Claude Code skill manifests.

This build delivers the full 7-phase plan plus three user-requested additions (phases 8a–8c): two
anti-skill manifests (`hallucinatemaxx`, `tokensprint`) and a maxxer module that composes every trick in a
single pipeline. All 22 TypeScript source files compile clean, the vitest suite passes, and the GitHub
Actions CI and release workflows are committed. npm publish and GitHub remote setup remain deferred to the
user.

---

## Phases — plan vs actual

| Phase | Planned | Actual | Status | Deviation |
|-------|---------|--------|--------|-----------|
| 1 — Scaffold | `package.json`, `tsconfig.json`, `.gitignore`, ESLint flat config, Prettier, MIT `LICENSE`, CI/release workflows, placeholder `src/`/`data/`/`tests/` directories | Full scaffold committed in one `chore(scaffold)` commit: `package.json` (ESM, `"type":"module"`, bin entries), `tsconfig.json` strict NodeNext, `eslint.config.js`, `.github/workflows/ci.yml` + `release.yml`, `LICENSE` | ✓ | None. The ESLint config was later ported to TypeScript and is now `eslint.config.ts`. |
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

tests/                      — 10 test files at the time of this build. The suite
                              has grown since (MCP coverage, regression tests)
                              and continues to; count the directory rather than
                              trusting this line. tests/global-setup.ts builds
                              the CLI once for the integration tests.
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
                              (now Node 22 + 26.2, and the gate also runs
                              build, web typecheck, and web build)
  release.yml               — manual workflow_dispatch; npm publish
                              (id-token: write is granted, but provenance is
                              not actually enabled — see DEPLOY.md)

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

Resolved since:

- ~~`gh auth login` not completed; `feat/initial-build` unpushed.~~ Pushed. The
  branch was merged and deleted.
- ~~`main` does not exist on the remote.~~ `main` is the default branch.
- ~~`npm publish` has not been run.~~ Published. `0.0.2` and `0.0.21` are on the
  registry; `latest` resolves to `0.0.21` until `0.1.0` ships.
- ~~`scripts/build-corpus.ts` presence not confirmed.~~ Present.

Still open:

- **Snapshot regression test.** `tests/snapshot/expansion.snap` was never
  committed and no test in `tests/` calls `toMatchSnapshot`. The plan required a
  committed snapshot so CI would catch an unintended change in transform output.
  The transforms are pure and deterministic, which is precisely the condition
  under which a snapshot test is cheap and worth having. Still outstanding.
- **`data/corpus.schema.json`.** Not present. `data/` contains `corpus.json`
  only. The plan called for a machine-checkable contract on the corpus; the
  corpus shape is currently enforced by TypeScript types and tests alone.
- **Branch protection.** Configuration on GitHub is unverified from here. See
  `GITHUB_SETUP.md`, and note that the required-status-check names must match
  the CI matrix exactly.
- **`NPM_TOKEN` secret.** Cannot be confirmed from the working tree. The
  workflow fails without it.

---

## What has shipped since this build

Three releases and one substantial feature. Full detail in `CHANGELOG.md`; the
summary, for a reader who arrived at this file first:

- **`0.0.2`** — the primary benchmark metric changed from `tok/char` to
  `tok/word`, which is the single most consequential decision the project has
  made and is now recorded as settled in `CLAUDE.md`. `tok/char` measures script
  density; `tok/word` measures tokenizer cost per unit of meaning. Inuktitut
  Syllabics remains rank 1 under both, so the headline finding survived the
  change. Also: the pnpm workspace migration, the Vue marketing site and its
  Pages deployment, the `justfile`, `verbose-galactic` plus three further
  transforms, and the `/yolo`, `/consultant`, and `/okay-boomer` skills. The CI
  matrix moved to Node 22 + 26.2.
- **`0.0.21`** — an accuracy pass. Skill counts, the npm badge, the site version
  pill, and the skill manifests were reconciled with the repository.
- **`0.1.0`** — the **MCP server** (`src/mcp/`), which is the reason the version
  moved to a new minor. A Model Context Protocol server over stdio, built on
  `@modelcontextprotocol/sdk` with `zod` schemas, exposing seven tools, eighteen
  resources, and one prompt per skill. It matters for a reason that goes to the
  premise of the project: before it existed, a skill asked to report an inflation
  ratio *estimated* the token count, and a skill asked to render `maxlang`
  *approximated* the transform from its own examples. Plausible, and not
  reproducible — the wrong way round for a tool whose entire claim is
  measurement. The server routes the skills through the same deterministic
  pipeline the CLI uses. It reads and computes only: no file writes, no child
  processes, no network.
  Also in `0.1.0`: the `anti-wenyan` mode renamed to `maxlang` (the old name is
  retained as a deprecated alias, scheduled for removal in `1.0`), a Nix dev
  shell, the `/auto` skill, and the `/docs` page.

The source tree has grown from the 22 TypeScript modules listed above to 37, and
the skills from three manifests to eight.

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

**Run the MCP server** (added in `0.1.0`, so absent from the phase table above):

```bash
node dist/mcp/bin.js          # stdio; a client spawns this, it has no CLI output
```

---

## Where to look next

- `CHANGELOG.md` for everything that happened after this build
- Configure the `NPM_TOKEN` secret and review the publish steps: `GITHUB_SETUP.md`
- Cut and publish `v0.1.0`: `DEPLOY.md`
- Commit a snapshot regression test for `expand()` — still outstanding
- Add `data/corpus.schema.json`, or record the decision not to
