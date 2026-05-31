# Changelog

All notable changes to **tokenmaxxingman** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `anti-wenyan` expand mode — canonical, stable name for whichever natural language the bundled benchmark currently elects as worst-tokenizing. Currently aliased to `translate-inuktitut` (Inuktitut Syllabics, rank 1 under both `cl100k_base` at 2.6158 tok/char and `o200k_base` at 2.6780 tok/char). The empirical opposite of `/caveman wenyan` (Classical Chinese, ~1.55 / ~1.04 tok/char).
- SKILL.md trigger phrases for "anti-wenyan", "anti wenyan", "opposite of wenyan", "opposite of caveman wenyan".

### Changed

- SKILL.md: removed "Phase 4 stub" / "pending benchmark" placeholder language. The benchmark has now been run against both encodings; the canonical anti-wenyan winner is empirically confirmed. SKILL version bumped from 0.1.0 → 0.2.0.
- README.md: corrected the Top 5 cl100k_base ranking (Amharic restored to rank 2, numbers updated to match `tmm benchmark` output) and added a new Top 5 table for `o200k_base` showing how the ranking shifts under the newer tokenizer.

## [0.1.0] — Unreleased

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

[Unreleased]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KangaZero/tokenmaxxingman/releases/tag/v0.1.0
