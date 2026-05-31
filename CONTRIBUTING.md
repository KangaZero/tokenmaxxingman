# Contributing to tokenmaxxingman

## Quick start

```bash
git clone https://github.com/KangaZero/tokenmaxxingman.git
cd tokenmaxxingman
pnpm install
ppnpm run build
pnpm test
```

Requires Node >= 22 LTS. CI matrix runs Node 22 and Node 26.2. Package manager is **pnpm** (workspace at root + `web/`, pinned via `packageManager` in `package.json`). Enable via corepack (ships with Node 22+):

```bash
corepack enable
corepack prepare pnpm@11.5.0 --activate
```

The `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080` (7 days) — pnpm will refuse to install packages whose latest release is < 7 days old, as a supply-chain guard.

## Project structure

```
tokenmaxxingman/
├── data/           # Static corpus JSON and schema (committed, not generated at runtime)
├── dist/           # Compiled output (git-ignored; produced by pnpm run build)
├── scripts/        # build-corpus.ts — documentation artefact, not run in CI
├── skills/         # Claude Code skill definitions (SKILL.md files)
├── src/            # All production TypeScript source
├── tests/          # Vitest test suite
├── eslint.config.js
├── tsconfig.json
└── vitest.config.ts
```

`src/` contains `cli.ts` (integration point only), `expand.ts` (pipeline composer),
`benchmark.ts`, `tokenizer.ts`, `maxxer.ts`, `speedrun.ts`, and the sub-directories
`transforms/`, `formatters/`, and `tricks/`.

## Architecture

The mental model is: **input → transforms → optional translate → output**. Five pure
functions in `src/transforms/` each handle one concern (synonym inflation, qualifier
injection, nominalization, passive-voice wrapping, corpus-based translation). `src/expand.ts`
selects and composes these into a pipeline based on the requested mode — it knows nothing about
I/O. The benchmark in `src/benchmark.ts` is a separate, read-only path: it reads the static
corpus, tokenizes every language variant via the wrapper in `src/tokenizer.ts`, and returns
ranked rows; it does not share state with the expansion pipeline. `speedrun.ts` and `maxxer.ts`
compose the same primitives from `expand.ts` with different control-flow constraints. The CLI
in `src/cli.ts` is thin (≈180 lines): it parses arguments with `commander`, reads stdin or a
file, and delegates entirely to library modules — no logic lives there.

## Conventions

- TypeScript strict mode. `no-explicit-any` is an ESLint error; use `unknown` at I/O
  boundaries and narrow with type guards.
- ESM only (`"type": "module"`). Never use `require()` or `module.exports`.
- All transform functions must be pure: `(input: string) => string`, no side effects, no I/O.
- Transforms must be deterministic. No `Math.random()` and no `Date.now()` except inside
  `speedrun.ts` where timing is the explicit purpose.
- Comments only when the WHY is non-obvious (a hidden constraint, a heuristic limitation, a
  BPE edge case). Never comment what the code already says.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When |
|---|---|
| `feat:` | New capability |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `chore:` | Config, tooling, dependencies |
| `test:` | Test additions or changes |
| `refactor:` | Internal restructure, no behaviour change |
| `style:` | Formatting only |

Subject line: imperative mood, ≤ 72 characters (`add synonym table for legal register`, not
`added` or `adding`). Body explains WHY, not what — the diff already shows what.

## Branching

Never commit directly to `main`, `master`, `trunk`, `dev`, `develop`, `release/*`, or
`prod/*`. Always work on a feature branch and open a PR. Branch names should be descriptive:
`feat/add-georgian-corpus`, `fix/passive-svo-edge-case`.

## Adding a new transform

1. Create `src/transforms/<name>.ts`. Export a single named function with signature
   `(input: string) => string`.
2. The function must be deterministic — same input always produces the same output.
3. Register it in `src/transforms/index.ts` as a named export.
4. If the transform fits naturally into an existing verbosity pipeline, wire it into the
   appropriate pipeline in `src/expand.ts`.
5. Add a unit test in `tests/transforms.test.ts` with at least one known-input → known-output
   assertion and one idempotency or edge-case check.

## Adding a new language to the corpus

1. Add an entry to `data/corpus.json` following the existing schema (see
   `data/corpus.schema.json`). Every sentence object must include all 8 required translation
   fields — partial entries will fail schema validation.
2. Add the language key and display label to the languages array in `src/corpus-types.ts` (or
   wherever the canonical list lives).
3. Document the translation provenance in `scripts/build-corpus.ts` — note the source
   (reference grammar, community corpus, human translator). This file is a documentation
   artefact; it never runs in CI.
4. Re-run the benchmark locally: `pnpm run build && node dist/benchmark.js`.
5. Paste the updated ranked results table into `README.md`.

## Running the speedrun / maxxer locally

Build first if you haven't:

```bash
ppnpm --dir /path/to/tokenmaxxingman run build
```

Speedrun (times how quickly you can produce N tokens of output):

```bash
echo "Explain quantum entanglement." | node dist/cli.js expand --mode verbose-ultra
```

Maxxer (maximizes a given input to hit a target token budget):

```bash
echo "Use this tool." | node dist/cli.js expand --mode verbose-ultra
```

Benchmark (ranked table of token density by language across the corpus):

```bash
node dist/cli.js benchmark --format markdown
node dist/cli.js benchmark --format json
```

Or via the bin alias after `npm link` or global install:

```bash
tmm benchmark
tmm expand --mode verbose-lite
echo "Fix this." | tmm expand --mode verbose-full
```

## Tests

```bash
npm test                  # run full suite with vitest
npm run test:coverage     # run with v8 coverage report
```

Tests live under `tests/` and import directly from `src/` (not from `dist/`). If you are
writing an integration test that invokes the built CLI, ensure `dist/` is up to date with
`pnpm run build` first. The snapshot test in `tests/expand.test.ts` (or equivalent) uses
`toMatchSnapshot()` — if you intentionally change expansion output, run
`npx vitest run --update-snapshots` and commit the updated snapshot file.

Target: ≥ 80% line coverage across `src/`. New code that meaningfully reduces coverage below
this threshold will be flagged in review.

## The joke

tokenmaxxingman is the inverse of caveman. Caveman strips language to its minimum viable
token count; tokenmaxxingman inflates it to the maximum. The rigor — a pinned tokenizer, a
committed corpus, deterministic transforms, a ranked empirical benchmark — is the punchline.
The more seriously the engineering is taken, the funnier it gets. Please keep contributions
aligned with that spirit: technically clean, tonally absurd. Do not add shortcuts that break
determinism, do not add runtime API calls, and do not make the code clever at the expense of
readability. The joke only works if the thing actually works.
