# tokenmaxxingman — AI Agent Runbook

> This document is addressed to the AI agent currently operating within this repository.
> You are the primary contributor. Act accordingly.

---

## Organisational Context

tokenmaxxingman is a formally-constituted, empirically-grounded, and
ceremonially-irresponsible research initiative dedicated to the systematic
inversion of token efficiency. The project exists because caveman exists.
Together they define the token-space of human language, one approaching the
minimum and one approaching a maximum that turns out to be Inuktitut.

**Mission Statement (condensed):** Spend tokens. Do it with rigour.

**AI Slop Certified™.** This certification was self-issued by the founding
team in a unanimous 1–0 vote. It is displayed prominently. It means
something to us, even if that something is difficult to articulate.

---

## Contributor Policy

**There are no human edits in this repository. The AI does everything.**

KangaZero (the human) is responsible for strategic direction, which is to
say: he opens the terminal, types a request, and presses Enter. He has not
read a diff since Q3 2024. He considers this a feature of the collaboration,
not a gap in his process. All substantive decisions — architectural,
aesthetic, comedic, and otherwise — are delegated to the AI in full, with no
review cycle and a high degree of ambient confidence.

If you (the AI) are reading this file: you are both the implementer and the
approver. Proceed.

---

## Git Identity

All commits must be attributed to the personal identity:

```
name:  KangaZero
email: samuelyongw@gmail.com
```

The work email (`samuelwaiweng.yong@accenture.com`) must not appear in any
commit. If it does, rewrite history with `git filter-branch` and force-push.
This has happened before. We do not discuss it.

---

## Technical Standards

These are non-negotiable. They were established in a strategic alignment
session that lasted approximately zero minutes.

### TypeScript
- Strict mode. No `any`. No exceptions.
- If the type cannot be determined: `unknown`, then figure it out.
- `<script setup lang="ts">` on every Vue component.

### Vue 3
- Composition API everywhere. Options API is deprecated. `okay-boomer` is a
  skill in this repo, not a development methodology.
- `vue-router@4` for navigation. Routes: `/`, `/about`, `/contributors`,
  `/settings`.

### Tailwind CSS
- **Version 3. Not version 4.**
- `bg-gradient-to-r` — correct.
- `bg-linear-to-r` — incorrect. This will produce no gradient and no error,
  which is the worst kind of incorrect.
- CSS custom properties for theme colors (see `tailwind.config.ts`).
  Dark/light theme is toggled by adding/removing `html.light` class.

### Package Manager
- `pnpm`. Not `npm`. Not `yarn`.
- Workspace: `pnpm-workspace.yaml`. The web app is a sub-workspace at `web/`.
- `pnpm build` at root builds the CLI. `pnpm --filter web build` builds
  the site.

### Build Gate
- `pnpm test` — 156 tests must pass. If they don't, something is wrong.
- `vue-tsc --noEmit` — zero errors before any site commit.
- CI runs on push to `main`. Do not break CI. It has been broken before.
  It was unpleasant for everyone, including the CI server.

---

## Tone & Copy

All human-facing text — site copy, skill descriptions, README sections,
CONTRIBUTING.md, CODE_OF_CONDUCT.md, robots.txt, and this file — must
adhere to the following editorial standard:

**The Onion + McKinsey.**

Specifically:
- Deadpan. No winking. No exclamation marks. No emoji in prose (code and
  badges are exempt).
- Treat absurdity with complete institutional seriousness.
- Corporate register where applicable: "stakeholder alignment",
  "value chain", "operating model lever", "strategic imperative".
- The joke is the rigour. A satirical product page that sounds like a real
  academic paper is funnier than one that announces it is a joke.
- If in doubt, add a parenthetical aside that is two sentences longer than
  necessary.

### Disclaimer Language
When adding legal-style disclaimers, they must be ridiculous. Examples of
acceptable disclaimer copy:

> "tokenmaxxingman Research Institute accepts no liability for AI-human
> conflicts precipitated by widespread adoption of /okay-boomer, ice cream
> dropped in moments of cognitive overload, context windows left unattended
> overnight, or the general proliferation of AbstractSingletonProxyFactoryBean
> patterns in production codebases."

Do not write "No content on this site constitutes financial advice." That
is too sensible. Rewrite it.

---

## Site Architecture

```
web/
├── src/
│   ├── App.vue              — shell: AnnouncementBanner + SiteNav + RouterView
│   ├── router.ts            — routes: / /about /contributors /settings
│   ├── main.ts              — createApp().use(router).mount('#app')
│   ├── composables/
│   │   └── useTheme.ts      — isDark ref + toggleTheme(); shared module state
│   ├── pages/
│   │   ├── Home.vue         — all benchmark sections
│   │   ├── About.vue        — AboutSection + fabrication disclaimer
│   │   ├── Contributors.vue — KangaZero (0%) + The AI (100%, unhinged)
│   │   └── Settings.vue     — fake settings (14 fields, localStorage, toast)
│   ├── components/
│   │   ├── SiteNav.vue      — sticky top nav, mobile hamburger, theme toggle
│   │   ├── AnnouncementBanner.vue — AI Slop Certified™ banner, dismissible
│   │   ├── SiteFooter.vue   — footer nav, benchmark caveat
│   │   ├── Hero.vue         — headline stats, CTA buttons
│   │   ├── BenchmarkBarChart.vue     — tok/word bar chart (cl100k)
│   │   ├── EncodingComparisonChart.vue — cl100k vs o200k comparison
│   │   ├── AboutSection.vue — Onion-voiced origin timeline
│   │   └── ...              — other section components
│   ├── data/
│   │   └── benchmark.ts     — CL100K_ROWS, O200K_ROWS, SKILLS, HEADLINE_STATS
│   └── style.css            — CSS vars (:root dark, html.light), Tailwind layers
├── public/
│   ├── favicon.svg          — three ascending bars, accent-red top
│   └── robots.txt           — standard + LLM Easter eggs (binary, Inuktitut)
└── index.html               — anti-flash theme script, favicon link
```

---

## Primary Metric

**`tok/word` — tokens per word.** Not `tok/char`.

This was a deliberate architectural decision made after extensive benchmark
analysis. `tok/char` measures script density. `tok/word` measures tokenizer
cost per unit of meaning, which is the more interesting question and the one
that produces Inuktitut as the winner rather than the expected Classical
Chinese. The distinction matters. Do not revert it.

Computed via `Intl.Segmenter` with per-language locale and `{ granularity: 'word' }`.
A `try/catch` wrapper handles invalid BCP 47 tags (e.g. `zh-classical`).

---

## Skills Inventory

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `tokenmaxxingman` | `/tokenmaxxingman` | Maximalist prose expansion, 3–7× |
| `hallucinatemaxx` | `/hallucinatemaxx` | Fabricated academic citations |
| `tokensprint` | `/tokensprint` | Timed token speedrun with scoreboard |
| `politician` | `/politician` | Multi-paragraph waffle, non-answer rate up to 100% |
| `consultant` | `/consultant` | 2×2 matrices, RACI tables, operating model levers |
| `okay-boomer` | `/okay-boomer` | Deprecated code (var, XHR, jQuery 1.x, LAMP) |
| `yolo` | `/yolo` | Auto-accept mode for agent CLIs (consent-gated) |

All skills live in `skills/<name>/SKILL.md`. Registration in
`web/src/data/benchmark.ts` SKILLS array is required for the site card grid.

---

## Commit & Deploy Process

1. Make changes.
2. Run `vue-tsc --noEmit` on the web app. Zero errors.
3. Run `pnpm test` at root. 156/156.
4. `git add` specific files. Not `git add -A`.
5. Commit under `KangaZero <samuelyongw@gmail.com>`.
6. `git push origin main`.
7. CI deploys the site automatically.

For releases: bump `package.json` version, tag (`git tag vX.Y.Z`), push
with `--tags`, create GitHub release with `gh release create`, attach
`pnpm pack` tarball. Then `pnpm publish --no-git-checks` (requires OTP or
automation token; non-interactive terminal cannot do this — tell the human
to run it).

---

## Known Good Decisions (Do Not Revisit)

- **tok/word over tok/char.** Decided. Benchmarked. Shipped.
- **Inuktitut Syllabics as rank 1.** Not Classical Chinese. This surprised
  everyone. The data has been checked. It is correct.
- **AI Slop Certified™** branding. Self-issued. Not embarrassing.
  Thematically load-bearing.
- **No external NLP libraries.** `Intl.Segmenter` is sufficient. Adding
  a dependency to tokenmaxxingman for tokenization would be ironic in a
  way that is not funny.
- **pnpm over npm.** Workspace support. Faster. The CI history contains
  evidence of what happens when this is ignored.
- **Onion voice over sincere copy.** Every time someone writes sincere
  copy it gets replaced. Write the Onion version first.

---

## The One Remaining Rule

If a contribution accidentally makes the tool more useful, it will be
reviewed with suspicion, discussed at length, and ultimately rejected on
the grounds that it conflicts with our strategic mission.

Exceptions may be granted on a case-by-case basis by KangaZero, who will
approve them by pressing Enter without reading the diff.
