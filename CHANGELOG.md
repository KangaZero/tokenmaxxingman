# Changelog

All notable changes to **tokenmaxxingman** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New `web/src/pages/Docs.vue` at route `/docs` — an internal Documentation page in the institutional register. Covers installation, a four-command CLI reference, a generated skills reference (sourced from the `SKILLS` array in `web/src/data/benchmark.ts`), the `tok/word` methodology, and a documentation disclaimer. Features an animated "Back" control (sliding accent-glow arrow, growing underline) that returns the visitor to their prior page, falling back to home on a cold deep-link.
- `web/src/components/GradientText.vue` — a dependency-free Vue 3 port of the react-bits `GradientText` (TS-CSS variant). An animated `background-clip: text` gradient sweeps across the phrase; palette read from CSS custom properties (`--gradient-line-1..5`) so it is theme-aware, with an optional `showBorder` animated-gradient border and static rendering under `prefers-reduced-motion`. Now used for the Hero headline's "opposite of caveman." line. (Supersedes the earlier `text-hover-effect` and `canvas-text` ports, both removed.)
- `web/src/components/RippleButton.vue` — an animate-ui-style ripple button. A transparent wrapper: parent `class`/`type`/`@click`/`aria-*` fall through and merge onto the underlying `<button>`, so existing styles and highlights are preserved while a `currentColor` ripple is spawned from the pointer-down point. Applied to the command and icon buttons across the site (Settings, Cookie dialog, nav hamburger/theme toggle, announcement dismiss, and the CTA buttons on Docs/Investors/Contributors/Testimonials). The form-control primitives (switch, checkbox, nav tabs) are intentionally excluded.
- `web/src/components/AnimatedCode.vue` — an animate-ui-style animated code block (port of `animate/code`). Window chrome (traffic-light dots + optional filename), a copy-to-clipboard control, a type-on reveal triggered by `IntersectionObserver`, and dependency-free shell syntax highlighting (prompt/command/flag/string/comment). Accessible raw source is exposed to assistive tech and copy is prompt-free; static under `prefers-reduced-motion`. Now backs the install commands (`InstallSection.vue`) and the Docs command reference.
- `web/src/components/AnimatedTabs.vue` — an animate-ui-style navigation tab strip with a single sliding highlight pill. The indicator rests on the current route and temporarily follows the hovered tab, springing back on pointer-leave (`highlightIndex = hoverIndex ?? activeIndex`). Now backs the desktop primary navigation.
- `web/src/components/ThemeToggler.vue` — an animate-ui-style theme-toggler button with a morphing sun/moon icon (rotate + scale crossfade). Replaces the inline theme toggle buttons in both the desktop and mobile navigation.
- `web/src/components/AnimatedSwitch.vue` — an animate-ui-style base switch with a spring-eased thumb and press feedback. Supports `v-model` and emits the originating `change` event so it can drive the themed reveal transition.
- `web/src/components/AnimatedCheckbox.vue` — an animate-ui-style headless checkbox with an SVG check that draws itself in via `stroke-dashoffset` (suppressed under `prefers-reduced-motion`).
- `web/src/components/CookieConsent.vue` — a ceremonial cookie-consent dialog that tracks nothing, deploys nothing, and requires agreement (via `AnimatedCheckbox`) to a 47,000-word instrument that governs nothing. Dismissal is persisted to localStorage. Mounted globally in `App.vue`.

### Changed

- `web/src/components/SiteFooter.vue`: the footer "Docs" link now routes to the internal `/docs` page via `RouterLink` instead of deep-linking to the GitHub README `#install` anchor in a new tab. Visitors stay on-site; `vue-router`'s `scrollBehavior` resets scroll.
- `web/src/components/Hero.vue`: the gradient "opposite of caveman." headline span is replaced with the animated `GradientText` component.
- `web/src/style.css`: added a per-theme five-stop line spectrum (`--gradient-line-1..5`, coral→rose→violet→sky) consumed by `GradientText`, with deeper/saturated values under `html.light` for legibility on the near-white background. Centralising the palette here keeps colour definitions DRY.
- Reviewer pass (three parallel review agents): `useTheme` init now runs once regardless of consumer count and guards `localStorage`; the View Transitions promise handles rejection; `AnimatedTabs` clears stale refs, re-measures on `document.fonts.ready`, sets `aria-current` on section tabs, and no longer sticks its highlight on touch (with keyboard-focus support); the scroll-spy waits a frame for the child route to mount; `CookieConsent` resolves the disabled-vs-nudge contradiction; and `Docs` back-navigation uses `history.state.back` instead of the unreliable `history.length`.
- `web/src/composables/useTheme.ts`: `toggleTheme` now accepts the originating `MouseEvent` and performs an expanding-circle reveal via the View Transitions API, originating from the click point. Falls back to an instant swap when the API is unavailable or `prefers-reduced-motion` is set. Supporting `::view-transition-*` rules added to `web/src/style.css`.
- `web/src/components/SiteNav.vue`: desktop primary nav uses `AnimatedTabs`; both nav theme toggles use `ThemeToggler`; `/docs` added to desktop tabs and the mobile menu.
- `web/src/pages/Settings.vue`: all four toggle switches (Theme, Auto-Verbosity, Auto-Boomer, PhD) replaced with `AnimatedSwitch`. The Theme switch drives the same View Transitions reveal via its `change` event.

- `web/src/style.css` + `web/src/App.vue`: a site-wide animated topography background (`.topo-bg`), mounted as a fixed layer behind all content. Built from layered `repeating-radial-gradient` rings (an original implementation — the reference page is client-rendered and exposes no source), with a slow `background-position` drift, theme-aware line colour via `--color-bone`, and animation disabled under `prefers-reduced-motion`. The former per-page `grid-bg` overlays and the now-unused `.grid-bg` utility were removed so topography is the sole background.

### Fixed

- `web/src/components/AboutSection.vue`: timeline dots overlapped the dates. The `v-reveal` transform on each `<li>` established it as the containing block for the absolutely-positioned dot, shifting every dot right by the list's `ms-6` inset onto the date. Offset corrected (`-start-[30px]`) so the dots sit back on the timeline line.
- `web/src/pages/Contributors.vue`: the two Team cards are now equal height (`lg:items-stretch` instead of `lg:items-start`).

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
