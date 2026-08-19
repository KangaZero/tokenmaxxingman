# Contributing to tokenmaxxingman

We are not here to help efficiently. We are here to spend tokens with the
unhurried magnanimity of a Belle Epoque dowager who has never once been
presented with a bill she found surprising.

This document describes, in rather more detail than is strictly necessary,
how one might go about contributing to a project whose primary measure of
success is the deliberate and principled waste of computational resources.

---

## The Mission

**Core metric: token amplification ratio.**

A contribution that doubles the token count of a given input is considered
satisfactory. A contribution that triples it while simultaneously reducing
the usefulness of the output is considered commendable. A contribution that
achieves 21× amplification — the empirical ceiling established by the Inuktitut
Syllabics benchmark — is the formal target. We do not expect to exceed it.
We have not stopped trying.

The amplification ratio is computed as:

```
amplification = tokens(output) / tokens(input)
```

Reproduce the benchmark at any time:

```bash
just benchmark
tmm benchmark --encoding cl100k_base
tmm benchmark --encoding o200k_base
```

---

## Adding a New Anti-Skill

### 1. Create the skill directory and SKILL.md

```bash
mkdir skills/<name>
touch skills/<name>/SKILL.md
```

Follow the frontmatter schema exactly:

```yaml
---
name: <slug>
version: "0.1.0"
description: >
  One-paragraph description. What it does, when it fires, what it produces.
  Token amplification ratio (measured or estimated).
trigger:
  - "/slug"
  - "natural language trigger"
  - "another trigger phrase"
---
```

A new skill starts at `0.1.0`; the skills that predate this convention started at
`0.0.1` and have not been renumbered. Thereafter the version is bumped independently of
the package version, by the skill's own semantics rather than the release train:
patch for a wording or example change, minor for a new intensity level, trigger
phrase, or behavioural rule, major for a change that invalidates an existing
invocation. The shipped skills have accordingly drifted apart — `hallucinatemaxx`,
`tokensprint`, and `yolo` are at `0.1.1` while `auto`, `consultant`,
`okay-boomer`, `politician`, and `tokenmaxxingman` are at `0.0.2` — and this is
the intended behaviour, not a synchronisation failure. Do not batch-align them.

### 2. Write the skill body

Required sections, in order:

1. **What This Is** — The philosophical premise. What inversion does this
   skill perform? What does it satirise? The joke must be stated plainly;
   it is funnier that way.

2. **When to Fire** — Explicit trigger conditions. List every invocation
   phrase. State that the skill persists across turns once activated.

3. **When NOT to Fire** — Categorical exemptions. These are non-negotiable:
   - Code blocks, variable names, function names, commit messages — never touched.
   - Debugging and error analysis — plain prose only.
   - Code review — precision required; baroque code review is actively harmful.
   - Security warnings and irreversible operations — always plain.
   - Structured data (JSON, YAML, TOML) — emitted normally.

4. **Before / After Examples** — A minimum of three examples demonstrating
   the transformation at each intensity level the skill supports. The examples
   must be measured, not estimated. Run `tmm benchmark` or count manually.

5. **Caveats** — The mandatory disclaimer. Include: "This is a joke skill."
   Include the deployment warning. Include the statement that plain, terse
   prose is the correct default and that this skill is a deliberate,
   measurable departure from it.

### 3. Register in `web/src/data/benchmark.ts`

Add an entry to the `SKILLS` array:

```typescript
{
  slug: '<name>',
  name: '<name>',
  tagline: 'One sentence. Deadpan.',
  description: 'Two sentences. Formal register. State the amplification.',
  triggers: ['/<name>', 'trigger phrase', 'another phrase'],
  accent: 'accent' | 'cool',
},
```

Alternate `accent` values across skills for visual variety on the skills grid.

### 4. Verify

```bash
just ci
```

The full test suite must pass — every test, no skips. We do not quote a test
count here, because the suite grows on most working days and a number in a
contributing guide is a number that misleads a new contributor within the week.
Run it and read the total off the runner. TypeScript strict mode; `tsc --noEmit`
must produce no output.

---

## Anti-Skill Quality Gate

A pull request introducing a new anti-skill will be evaluated against the
following criteria. Failure on any criterion is grounds for rejection.

### (a) It must produce more tokens than the original.

This is not negotiable. An anti-skill that produces equal or fewer tokens
is not an anti-skill. It is a skill, and it is in the wrong repository.
We are not angry. We are merely redirecting.

### (b) It must preserve technical accuracy while destroying usefulness.

The transformation must be semantically faithful. The output must mean the
same thing as the input, in the same way that a 12-paragraph legal contract
means the same thing as a handshake. Accuracy is the constraint. Usefulness
is the target.

### (c) It must be funny through rigor, not randomness.

The output must be predictable. A Markov chain that occasionally produces
verbose sentences is not an anti-skill; it is entropy. The amplification
must follow a documented, reproducible pipeline. The joke depends on the
procedure. A baroque transformation performed inconsistently is merely verbose.
Ours is baroque with procedure.

### (d) The token amplification ratio must be measurable.

Estimate it in the SKILL.md. Measure it. If the measured ratio is below 2×,
reconsider the scope of the transformation. If it is above 10×, document
the pipeline in detail. If it is above 20×, you may have discovered something
important and should open an issue before submitting a PR. Bring data. We will
not accept your findings on vibes alone, which is ironic, and we are aware of it.

### The One Rule

> **If your contribution accidentally makes the tool more useful, it will be
> rejected.**

This is not cruelty. It is quality control. The satirical premise collapses
the moment the tool does something genuinely helpful. We have worked very
hard to avoid this. This rule has never been triggered. Either our contributors
understand the assignment, or nobody has contributed yet. We prefer to believe
the former. We have not checked.

---

## Adding a Benchmark Language

The benchmark measures token cost for a fixed semantic payload across language
variants. To add a new language:

### 1. Add the language corpus to `src/benchmark.ts`

```typescript
{
  code: 'xx',       // BCP 47 tag, or custom if BCP 47 is unavailable
  name: 'Language Name',
  locale: 'xx',    // passed to Intl.Segmenter for word counting
  sentences: [
    'Sentence one, translated.',
    'Sentence two, translated.',
    // ... 8 sentences total, matching the canonical English corpus
  ],
}
```

The canonical corpus is 8 sentences covering: a declarative statement, a
question, a technical instruction, a hedged assertion, a list, a warning,
a complaint, and an imperative. Match the semantic payload; do not paraphrase.

### 2. Run the benchmark

```bash
pnpm test
just benchmark
```

The test suite will compute `tokensPerCharacter`, `tokensPerWord`, and
`tokensPerSentence` for both `cl100k_base` and `o200k_base`. If the language's
BCP 47 tag is invalid, `Intl.Segmenter` will fall back to `undefined` locale
and word count may be approximate — document this in the SKILL.md if relevant.

### 3. Update `web/src/data/benchmark.ts`

Copy the computed values into `CL100K_ROWS` and `O200K_ROWS`, maintaining
sort order by `tokensPerWord` descending.

---

## Running Tests

```bash
just ci          # full gate: typecheck + lint + test + build
just web-dev     # spin up the Vite dev server for the web app
just benchmark   # re-run the benchmark and print the table
pnpm test        # vitest only
tsc --noEmit     # typecheck only
```

The CI gate runs identically locally and in GitHub Actions. If it passes
locally, it passes in CI. If it fails in CI but not locally, check `node`
and `pnpm` versions.

---

## Code Style

**TypeScript always.** No `any`. If the type cannot be determined, use
`unknown` as a last resort and document why. The compiler is an ally.

**No external libraries** unless the library is:
1. Genuinely the industry-standard solution for the problem, AND
2. Actively maintained (last commit within the last year), OR
3. Unmaintained for at least a decade and you have a very good reason.

The third clause exists for `okay-boomer` mode compatibility testing only.
Do not use it in production code.

**Functional style preferred.** Hooks, pure functions, composition over
inheritance. Small focused functions. No class hierarchies.

**DRY, but readability first.** Three similar lines is not necessarily an
abstraction opportunity. Do not extract a function unless it will be called
from more than one place or the name meaningfully clarifies intent.

**Zero comments** unless the WHY is non-obvious. The code is the documentation.
The SKILL.md is the specification. Comments are not the README.

---

## Submitting a Pull Request

1. Fork the repo. Branch from `main`.
2. Name the branch: `feat/<slug>` for new skills, `fix/<thing>` for fixes,
   `bench/<language>` for benchmark additions.
3. Run `just ci`. All checks must pass.
4. Open the PR against `main`. The title should be one line. The body should
   include: what the skill does, the measured amplification ratio, and the
   before/after example that best demonstrates the satire.
5. Do not include the phrase "looking forward to your feedback" in the PR body.
   We are not running a feelings seminar. We are reviewing code.

---

*tokenmaxxingman is a joke. The Contributor Covenant at `CODE_OF_CONDUCT.md`
is not. Please read it.*
