# Changelog

All notable changes to **tokenmaxxingman** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `plan_token_budget` MCP tool and `tokenmaxxingman budget` CLI subcommand. Given
  a token target — `million`, `billion`, `trillion`, or an explicit count — they
  report the time required, the number of conversations needed at a given context
  window, the approximate byte volume, and a plain verdict. Throughput is derived
  from the highest published `tokensprint` tier rather than asserted, so the
  figures follow the tier table if it is ever revised. No monetary estimate is
  produced: provider pricing changes faster than this file would be updated, and
  a stale figure quoted to this many significant digits would be worse than none.
- `sprint-1t` documented in the `tokensprint` and `tokenmaxxingman` skills as a
  **projection** tier rather than an attempt. One trillion tokens is 1,000,000
  hours (114.16 years) of continuous generation across 5,000,000 conversations
  and roughly 4.0 TB of prose; it does not fit in any context window by six
  orders of magnitude. Both skills are explicitly forbidden from fabricating
  progress toward it.

### Fixed

- `tokenmaxxingman expand` and `maxxer` no longer hang forever on an interactive
  terminal with nothing piped in; they now explain how to supply input and exit 2.
- Numeric CLI flags reject non-numeric input instead of silently truncating it.
  `--passes 3abc` was accepted as 3, and `--max-iterations 1e10` was read as 1 —
  a flag that appeared to request ten billion iterations requested one.
- `--padding-multiplier` is bounded to 1-20, matching the MCP tool. Unbounded, it
  produced 240 MB of output from two sentences.


Nothing recorded. Work lands here before it is versioned.

## [0.1.0] — 2026-08-19

### Added

- **MCP server** (`tmm-mcp` / `tokenmaxxingman-mcp`) — a Model Context Protocol server over stdio, built on `@modelcontextprotocol/sdk` v1.30.0. Exposes seven tools (`expand_text`, `maxx_text`, `count_tokens`, `benchmark_languages`, `plan_speedrun`, `list_modes`, `get_skill`), eighteen resources (`skill://<name>/SKILL.md` and `skill://<name>/EXAMPLES.md` for all eight skills, plus `benchmark://cl100k_base` and `benchmark://o200k_base`), and one prompt per skill. The skills previously estimated token counts and approximated expansions in-model; with the server registered they call the same deterministic pipeline the CLI calls, so the reported numbers are measured and the output is reproducible. Read/compute only — no file writes, no child processes, no network. Registered with `claude mcp add tokenmaxxingman -- npx -y tokenmaxxingman tmm-mcp` or via a project-scoped `.mcp.json`. Documented in the new README `MCP server` section. Keywords `mcp` and `model-context-protocol` added to the package metadata.

- New `web/src/pages/Docs.vue` at route `/docs` — an internal Documentation page in the institutional register. Covers installation, a four-command CLI reference, a generated skills reference (sourced from the `SKILLS` array in `web/src/data/benchmark.ts`), the `tok/word` methodology, and a documentation disclaimer. Features an animated "Back" control (sliding accent-glow arrow, growing underline) that returns the visitor to their prior page, falling back to home on a cold deep-link.
- `web/src/components/GradientText.vue` — a dependency-free Vue 3 port of the react-bits `GradientText` (TS-CSS variant). An animated `background-clip: text` gradient sweeps across the phrase; palette read from CSS custom properties (`--gradient-line-1..5`) so it is theme-aware, with an optional `showBorder` animated-gradient border and static rendering under `prefers-reduced-motion`. Now used for the Hero headline's tagline. (Supersedes the earlier `text-hover-effect` and `canvas-text` ports, both removed.)
- `web/src/components/RippleButton.vue` — an animate-ui-style ripple button. A transparent wrapper: parent `class`/`type`/`@click`/`aria-*` fall through and merge onto the underlying `<button>`, so existing styles and highlights are preserved while a `currentColor` ripple is spawned from the pointer-down point. Applied to the command and icon buttons across the site (Settings, Cookie dialog, nav hamburger/theme toggle, announcement dismiss, and the CTA buttons on Docs/Investors/Contributors/Testimonials). The form-control primitives (switch, checkbox, nav tabs) are intentionally excluded.
- `web/src/components/AnimatedCode.vue` — an animate-ui-style animated code block (port of `animate/code`). Window chrome (traffic-light dots + optional filename), a copy-to-clipboard control, a type-on reveal triggered by `IntersectionObserver`, and dependency-free shell syntax highlighting (prompt/command/flag/string/comment). Accessible raw source is exposed to assistive tech and copy is prompt-free; static under `prefers-reduced-motion`. Now backs the install commands (`InstallSection.vue`) and the Docs command reference.
- `web/src/components/AnimatedTabs.vue` — an animate-ui-style navigation tab strip with a single sliding highlight pill. The indicator rests on the current route and temporarily follows the hovered tab, springing back on pointer-leave (`highlightIndex = hoverIndex ?? activeIndex`). Now backs the desktop primary navigation.
- `web/src/components/ThemeToggler.vue` — an animate-ui-style theme-toggler button with a morphing sun/moon icon (rotate + scale crossfade). Replaces the inline theme toggle buttons in both the desktop and mobile navigation.
- `web/src/components/AnimatedSwitch.vue` — an animate-ui-style base switch with a spring-eased thumb and press feedback. Supports `v-model` and emits the originating `change` event so it can drive the themed reveal transition.
- `web/src/components/AnimatedCheckbox.vue` — an animate-ui-style headless checkbox with an SVG check that draws itself in via `stroke-dashoffset` (suppressed under `prefers-reduced-motion`).
- `web/src/components/CookieConsent.vue` — a ceremonial cookie-consent dialog that tracks nothing, deploys nothing, and requires agreement (via `AnimatedCheckbox`) to a 47,000-word instrument that governs nothing. Dismissal is persisted to localStorage. Mounted globally in `App.vue`.
- `skills/auto/SKILL.md` + `skills/auto/EXAMPLES.md` — the `/auto` skill (Autonomy Inversion Protocol). Reverses the operating model: Claude stops implementing and becomes the delegator — issuing work items with acceptance criteria and non-negotiable deadlines, chairing the standup, and returning the human's diffs with a numbered list of non-blocking concerns. The empirical inverse of `/yolo` and of the repository's "the AI does everything" contributor policy. Registered in the site `SKILLS` grid and the CLAUDE.md skills inventory.
- `flake.nix` + `flake.lock` — a reproducible Nix dev shell. `nix develop` provides the CI toolchain (Node 26 + pnpm + just) and installs git hooks via the `shellHook`: Nix hygiene (nixfmt/statix/deadnix) plus a `check-author` pre-push guard that enforces the KangaZero-only commit-identity rule.
- `scripts/prepare-skills.sh` + a `package.json` `prepare` script — a local `pnpm install` now symlinks the bundled skills into `~/.claude/skills` (via `install-skills.sh`). Uses the `prepare` lifecycle (not `postinstall`) so a registry consumer's home directory is never touched; no-ops under CI, `TMM_SKIP_SKILLS_INSTALL`, or a missing `$HOME`, and a skill-link failure is non-fatal to install/publish.
- Two skills backfilled into the site `SKILLS` grid — `consultant` and `yolo` shipped as skills but were absent from the grid, so `HEADLINE_STATS.skillsShipped` (derived from `SKILLS.length`) under-reported. The grid now lists all eight skills.
- `web/src/pages/Testimonials.vue`: a testimonial from a vibe coder who ran `/auto`, was conscripted into doing all the work, and can no longer establish, to the evidentiary standard they now hold themselves to, that the AI was ever a separate party.

### Changed

- The `anti-wenyan` expand mode is renamed **`maxlang`**, which is now the canonical name. It resolves, as before, to whichever natural language the bundled benchmark currently ranks first — the primary sort key is tokens-per-word, with tokens-per-character as the tiebreak — presently Inuktitut Syllabics (`iu-cans`), which leads on both: 21.0455 tok/word and 2.6158 tok/char under `cl100k_base`, 21.5455 and 2.6780 under `o200k_base`. `anti-wenyan` is retained as a deprecated alias so flags and skill triggers published in `0.0.21` keep working; it is scheduled for removal in `1.0`.
- All documentation is now self-standing. The project was previously framed against an external compression tool — in the README intro and acknowledgements, `CLAUDE.md`, `BUILD-SUMMARY.md`, `plan.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and the `examples/` fixtures — and every such reference has been rewritten. The stated reference point is now the **token floor of plain prose**, which the bundled benchmark measures directly. The README acknowledgements section credits what the project actually builds on: `gpt-tokenizer` v3.4.0 and the published `cl100k_base` / `o200k_base` BPE vocabularies. No benchmark number, rank, or technical claim changed.
- `web/src/components/SiteFooter.vue`: the footer "Docs" link now routes to the internal `/docs` page via `RouterLink` instead of deep-linking to the GitHub README `#install` anchor in a new tab. Visitors stay on-site; `vue-router`'s `scrollBehavior` resets scroll.
- `web/src/components/Hero.vue`: the gradient headline tagline span is replaced with the animated `GradientText` component.
- `web/src/style.css`: added a per-theme five-stop line spectrum (`--gradient-line-1..5`, coral→rose→violet→sky) consumed by `GradientText`, with deeper/saturated values under `html.light` for legibility on the near-white background. Centralising the palette here keeps colour definitions DRY.
- Reviewer pass (three parallel review agents): `useTheme` init now runs once regardless of consumer count and guards `localStorage`; the View Transitions promise handles rejection; `AnimatedTabs` clears stale refs, re-measures on `document.fonts.ready`, sets `aria-current` on section tabs, and no longer sticks its highlight on touch (with keyboard-focus support); the scroll-spy waits a frame for the child route to mount; `CookieConsent` resolves the disabled-vs-nudge contradiction; and `Docs` back-navigation uses `history.state.back` instead of the unreliable `history.length`.
- `web/src/composables/useTheme.ts`: `toggleTheme` now accepts the originating `MouseEvent` and performs an expanding-circle reveal via the View Transitions API, originating from the click point. Falls back to an instant swap when the API is unavailable or `prefers-reduced-motion` is set. Supporting `::view-transition-*` rules added to `web/src/style.css`.
- `web/src/components/SiteNav.vue`: desktop primary nav uses `AnimatedTabs`; both nav theme toggles use `ThemeToggler`; `/docs` added to desktop tabs and the mobile menu.
- `web/src/pages/Settings.vue`: all four toggle switches (Theme, Auto-Verbosity, Auto-Boomer, PhD) replaced with `AnimatedSwitch`. The Theme switch drives the same View Transitions reveal via its `change` event.

- `web/src/components/HexagonBackground.vue` + `web/src/App.vue`: a site-wide animated hexagon background (animate-ui `backgrounds/hexagon`), mounted as a fixed `-z-10` layer behind all content. A canvas draws the honeycomb once (correct flat-top hex lattice, DPR-aware, redrawn on resize/theme change, theme-aware via `--color-bone`); a soft accent glow drifts across with `mix-blend-mode: screen` so the cells appear to light up in a passing wave, disabled under `prefers-reduced-motion`. Original canvas implementation — the reference page is client-rendered and exposes no source. The former per-page `grid-bg` overlays and the now-unused `.grid-bg` utility were removed so this is the sole background.
- Install instructions (README path B + `web/src/components/InstallSection.vue`): now cover `npm` / `pnpm` / `bun` for a global install and `npx` / `pnpm dlx` / `bunx` for a one-off run without installing. The site's "Clone + install script" card was corrected from `npm install && npm run build` to `pnpm install && pnpm run build`, matching the repository's pnpm mandate.
- Skill count reconciled to **8** across `README.md` and the `CLAUDE.md` skills inventory (previously stated inconsistently — five in the enumerated README list, seven elsewhere).

### Fixed

- Flaky CLI test on the Node 26.2 CI matrix (`tests/cli.test.ts` "expand via stdin … Utilize"). Each CLI-spawning test file rebuilt in `beforeAll` via `rm -rf dist && tsc`; parallel Vitest workers could wipe `dist/` while another worker spawned `dist/cli.js`, importing a half-written module (`SyntaxError: … no export 'passive'`). The build now runs once via a Vitest `globalSetup` (`tests/global-setup.ts`); the per-file `beforeAll` rebuilds were removed.

- `web/src/components/AboutSection.vue`: timeline dots overlapped the dates. The `v-reveal` transform on each `<li>` established it as the containing block for the absolutely-positioned dot, shifting every dot right by the list's `ms-6` inset onto the date. Offset corrected (`-start-[30px]`) so the dots sit back on the timeline line.
- `web/src/pages/Contributors.vue`: the two Team cards are now equal height (`lg:items-stretch` instead of `lg:items-start`).

- Documentation defects reported by an internal audit pass. The benchmark's primary sort key is
  tokens-per-word, with tokens-per-character as the tiebreak (`src/benchmark.ts`); the README and this
  file had described tokens-per-character as primary. The README MCP tool table omitted the `locale`
  parameter on `expand_text`, `maxx_text`, and `count_tokens`, and `seed` on `plan_speedrun`. The
  `DEPLOY.md` `--help` transcript predated the `mcp` and `maxxer` subcommands and the move to
  `commander` v15. `GITHUB_SETUP.md` instructed the reader to require a `Node 24` status check that the
  CI matrix does not produce — a required check that never reports blocks every pull request
  indefinitely — and still documented a branch topology (`feat/initial-build` as the only remote
  branch) retired several releases ago. Provenance attestation was described as configured in four
  places; it is not. Hardcoded test counts were replaced with the invariant, on the grounds that a
  number in prose is a number that goes stale. This entry documents corrections to the documentation
  only. No behaviour changed.

## [0.0.21] — 2026-07-14

### Changed

- Version bumped `0.0.2` → `0.0.21`. Published to npm; `latest` resolves here until `0.1.0` ships.
- Accuracy pass across the site, `README.md`, and the skill manifests. The stated skill count was
  corrected from four/five to seven, the npm badge was repointed at the published version, and the
  site hero's version pill and test count were brought back in line with the repository.
- `skills/tokenmaxxingman/SKILL.md`: `tok/char` replaced with `tok/word` throughout, with every rank
  and value re-read from live `tmm benchmark` output (`iu-cans`: 21.0455 tok/word under
  `cl100k_base`, 21.5455 under `o200k_base`). The manifest had continued to quote the pre-`0.0.2`
  metric after the primary metric changed.
- `web/src/style.css`: custom scrollbar built from the existing CSS custom properties (WebKit and
  Firefox).

> **Reconstruction note.** This section was written after the fact from the tags and commit history
> in this repository (`v0.0.2..v0.0.21`) rather than from a changelog entry recorded at release time.
> It is therefore a faithful summary of the commits, not a contemporaneous record. Entries that left
> no trace in the history are, necessarily, absent.

## [0.0.2] — 2026-07-14

### Added

- `/yolo` — consent-gated auto-accept setup for agent CLIs.
- `/consultant` — 2×2 matrices, RACI tables, and OKR cascades applied to questions that did not ask
  for them.
- `/okay-boomer` — deprecated-everything mode, plus favicon and logo, accessibility fixes, and the
  community documents (`CODE_OF_CONDUCT.md`, issue templates).
- Three additional token-burning transforms and the `verbose-galactic` mode.
- The Vue 3 marketing site and its GitHub Pages deployment workflow, a multi-page router with
  dark/light theming, the AI Slop Certified™ announcement banner, the About timeline, and
  `robots.txt` with the LLM easter eggs.
- A `justfile` wrapping the common recipes.

### Changed

- **Primary benchmark metric switched from `tok/char` to `tok/word`.** `tok/char` measures script
  density; `tok/word` measures tokenizer cost per unit of meaning, which is the more interesting
  question and the one that elects Inuktitut Syllabics rather than the expected Classical Chinese.
  `tok/char` is retained as the tiebreak and as a reported column. Documented as a settled decision
  in `CLAUDE.md`.
- Migrated to a pnpm workspace (root CLI + `web/`) with a 7-day `minimumReleaseAge` supply-chain
  guard, and rewrote the `npm` command examples in the user-facing documents accordingly.
- CI matrix moved from Node 22 + 24 to Node 22 + 26.2.
- ESLint and PostCSS configuration ported to TypeScript (`eslint.config.ts`).

### Fixed

- Audit-flagged logic defects across the pipeline, restored Vue prop types, and a delta sign that
  reported its own direction incorrectly.
- CI installs: `onlyBuiltDependencies` / `allowBuilds` handling for `esbuild` in
  `pnpm-workspace.yaml`.

> **Reconstruction note.** As with `0.0.21`, this section was assembled after the fact from
> `v0.0.1..v0.0.2` in this repository's history.

## [0.0.1] — 2026-05-31 (first public release)

### Added

- `anti-wenyan` expand mode — canonical, stable name for whichever natural language the bundled benchmark currently elects as worst-tokenizing. Currently aliased to `translate-inuktitut` (Inuktitut Syllabics, rank 1 under both `cl100k_base` at 2.6158 tok/char and `o200k_base` at 2.6780 tok/char). Measured against the Classical Chinese density baseline (~1.55 / ~1.04 tok/char).
- SKILL.md trigger phrases for "anti-wenyan", "anti wenyan", "opposite of wenyan", "most verbose language".
- New `skills/politician/SKILL.md` — deflection-and-waffle skill. Yes/no questions become multi-paragraph waffle; approximately half the time, the question is never actually answered. Three intensity levels: `backbench` / `full` (default) / `filibuster`. Includes a Mistake-Handling Doctrine for the "deny, gaslight, scapegoat, pivot, reset" pattern when called on a hallucination — with a hard limit that drops the register when real correctness is at stake (code bugs, security, medical/legal/financial).
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` — Claude Code plugin packaging. The repo is now its own installable marketplace. Users can install via `/plugin marketplace add KangaZero/tokenmaxxingman` then `/plugin install tokenmaxxingman@tokenmaxxingman`.

### Changed

- `tokenmaxxingman` SKILL.md: removed "Phase 4 stub" / "pending benchmark" placeholder language. The benchmark has now been run against both encodings; the canonical anti-wenyan winner is empirically confirmed.
- README.md: corrected the Top 5 cl100k_base ranking (Amharic restored to rank 2, numbers updated to match `tmm benchmark` output) and added a new Top 5 table for `o200k_base` showing how the ranking shifts under the newer tokenizer.
- `package.json` `files` array now includes `.claude-plugin` so the manifest ships with the npm package.

### Notable empirical finding (carried over from initial scaffolding)

The benchmark's rank-1 token-MAXXER is **Inuktitut Syllabics (`iu-cans`)** at 2.6158 tokens-per-character (`cl100k_base`) and 2.6780 (`o200k_base`). It is the only natural-language entry whose ratio *worsens* under the newer encoding — every other non-Latin script gets *better* compression. That asymmetry is what `tokenmaxxingman` operationalises as the canonical `anti-wenyan` mode.

### The initial build

> **Historical note.** The block below was originally recorded under an unreleased `0.1.0`
> heading. That scaffolding was never published under that number — it shipped as `0.0.1`, and
> `0.1.0` was subsequently used for the release above. The entries are retained verbatim, under the
> version that actually carried them, so the record of the initial build survives the correction.
> They describe the repository as it stood in May 2026; several details (the CI matrix, the ESLint
> config file extension, the mode inventory) have since moved on and are tracked in the later
> sections.

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

- `skills/tokenmaxxingman/` — primary maximalist skill manifest with intensity levels.
- `skills/hallucinatemaxx/` — joke anti-skill (stylistic fabrication only, do NOT use for facts).
- `skills/tokensprint/` — speedrun anti-skill with sprint-1m/5m/10m/1h tiers.

**Tooling**

- GitHub Actions CI (`.github/workflows/ci.yml`) — typecheck + lint + test on Node 22 + 24 matrix.
- GitHub Actions release workflow (`.github/workflows/release.yml`) — manual `workflow_dispatch`, npm publish with provenance.
- TypeScript strict, ESM-only, vitest, ESLint v9 flat config, Prettier.

### Notable empirical finding

The benchmark's rank-1 token-MAXXER is **Inuktitut Syllabics (`iu-cans`)** at 2.6158 tokens-per-character (`cl100k_base` encoding). The rank-18 token-MINIMIZER is **English legalese** at 0.1953 — beating Classical Chinese (rank 11/18), the conventional choice for meaning-dense compression. BPE tokenizers aggressively merge common English substrings, so verbose English is more token-efficient *per character* than Han ideographs.

[Unreleased]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.0.21...v0.1.0
[0.0.21]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.0.2...v0.0.21
[0.0.2]: https://github.com/KangaZero/tokenmaxxingman/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/KangaZero/tokenmaxxingman/releases/tag/v0.0.1
