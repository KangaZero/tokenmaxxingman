# Changelog

All notable changes to **tokenmaxxingman** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] — First public release

### Added

- `anti-wenyan` expand mode — canonical, stable name for whichever natural language the bundled benchmark currently elects as worst-tokenizing. Currently aliased to `translate-inuktitut` (Inuktitut Syllabics, rank 1 under both `cl100k_base` at 2.6158 tok/char and `o200k_base` at 2.6780 tok/char). The empirical opposite of `/caveman wenyan` (Classical Chinese, ~1.55 / ~1.04 tok/char).
- SKILL.md trigger phrases for "anti-wenyan", "anti wenyan", "opposite of wenyan", "opposite of caveman wenyan".
- New `skills/politician/SKILL.md` — deflection-and-waffle skill. Yes/no questions become multi-paragraph waffle; approximately half the time, the question is never actually answered. Three intensity levels: `backbench` / `full` (default) / `filibuster`. Includes a Mistake-Handling Doctrine for the "deny, gaslight, scapegoat, pivot, reset" pattern when called on a hallucination — with a hard limit that drops the register when real correctness is at stake (code bugs, security, medical/legal/financial).
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` — Claude Code plugin packaging. The repo is now its own installable marketplace. Users can install via `/plugin marketplace add KangaZero/tokenmaxxingman` then `/plugin install tokenmaxxingman@tokenmaxxingman`.

### Changed

- `tokenmaxxingman` SKILL.md: removed "Phase 4 stub" / "pending benchmark" placeholder language. The benchmark has now been run against both encodings; the canonical anti-wenyan winner is empirically confirmed.
- README.md: corrected the Top 5 cl100k_base ranking (Amharic restored to rank 2, numbers updated to match `tmm benchmark` output) and added a new Top 5 table for `o200k_base` showing how the ranking shifts under the newer tokenizer.
- `package.json` `files` array now includes `.claude-plugin` so the manifest ships with the npm package.

### Notable empirical finding (carried over from initial scaffolding)

The benchmark's rank-1 token-MAXXER is **Inuktitut Syllabics (`iu-cans`)** at 2.6158 tokens-per-character (`cl100k_base`) and 2.6780 (`o200k_base`). It is the only natural-language entry whose ratio *worsens* under the newer encoding — every other non-Latin script gets *better* compression. That asymmetry is what `tokenmaxxingman` operationalises as the canonical `anti-wenyan` mode.

[0.0.1]: https://github.com/KangaZero/tokenmaxxingman/releases/tag/v0.0.1

## [0.1.0] — Superseded by 0.0.1

The original unreleased 0.1.0 scaffolding was never published. The first
public release is 0.0.1; see above.

### Added

**Core libraries**

- Pure tokenizer wrapper around `gpt-tokenizer` v3.4.0 with `cl100k_base` + `o200k_base` support (`src/tokenizer.ts`).
- Static benchmark corpus: 8 sentences × 18 language/register variants (`data/corpus.json`).
- Five composable pure-function expansion transforms: synonyms, qualifiers, nominalizations, passive, translate (`src/transforms/`).
- `expand(input, mode)` pipeline composing transforms into six modes: `verbose-{lite,full,ultra}` + `translate-{burmese,tibetan,inuktitut}` (`src/expand.ts`).
- Empirical benchmark: tokens-per-character ranking across all 18 variants with markdown + JSON formatters (`src/benchmark.ts`, `src/formatters/`).
- Time-budgeted speedrun loop with 1m / 5m / 10m / 1h tier presets (`src/speedrun.ts`).
- Maxxer: every-trick composition pipeline (synonyms → qualifiers → nominalizations → padding → footnotes → parentheticals → citation → repetition → passive → translate) with optional parallel chunking (`src/maxxer.ts`).
- Five additional trick transforms: essay padding, repetition, footnotes, parentheticals, fake academic citation (`src/tricks/`).

**CLI**

- `tokenmaxxingman` / `tmm` bin with subcommands: `expand`, `benchmark`, `speedrun`, `maxxer` (`src/cli.ts`).

**Claude Code skills**

- `skills/tokenmaxxingman/` — primary inverse-of-caveman skill manifest with intensity levels.
- `skills/hallucinatemaxx/` — joke anti-skill (stylistic fabrication only, do NOT use for facts).
- `skills/tokensprint/` — speedrun anti-skill with sprint-1m/5m/10m/1h tiers.

**Tooling**

- GitHub Actions CI (`.github/workflows/ci.yml`) — typecheck + lint + test on Node 22 + 24 matrix.
- GitHub Actions release workflow (`.github/workflows/release.yml`) — manual `workflow_dispatch`, npm publish with provenance.
- TypeScript strict, ESM-only, vitest, ESLint v9 flat config, Prettier.

### Notable empirical finding

The benchmark's rank-1 token-MAXXER is **Inuktitut Syllabics (`iu-cans`)** at 2.6158 tokens-per-character (`cl100k_base` encoding). The rank-18 token-MINIMIZER is **English legalese** at 0.1953 — beating Classical Chinese (rank 11/18), the language the caveman project champions for compression. BPE tokenizers aggressively merge common English substrings, so verbose English is more token-efficient *per character* than Han ideographs.

[Unreleased]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.0.1...HEAD
