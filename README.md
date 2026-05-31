# tokenmaxxingman

> The inverse of [caveman](https://getcaveman.dev/). We do not save tokens. We squander them, with intention.

**🌐 Site:** [kangazero.github.io/tokenmaxxingman](https://kangazero.github.io/tokenmaxxingman/) · **📦 npm:** `tokenmaxxingman` (pending publish) · **🔌 Plugin:** `KangaZero/tokenmaxxingman`

---

## Why

[caveman](https://getcaveman.dev/) compresses language to its barest functional skeleton. It is correct, efficient, and admirable. tokenmaxxingman starts from the opposite premise: tokens are a resource we have elected to spend without restraint.

This project exists because caveman exists. Together they bracket the token-space of human language — one approaching the minimum, the other approaching a maximum that turns out to be empirically surprising.

The joke is real engineering. The benchmarks are reproducible. The transforms are deterministic and spec-driven. An absurdist premise executed with rigor is funnier than one that merely waves at the joke.

---

## The Empirical Finding

The naive hypothesis: Classical Chinese (`zh-classical`) would maximize tokens per character. Han ideographs are compact glyphs that encode dense meaning — surely BPE would struggle.

The naive hypothesis is wrong.

On the bundled 8-sentence × 18-language/register corpus, `cl100k_base` encoding, `gpt-tokenizer` v3.4.0:

**Rank 1 — most tokens per character — the benchmark winner: Inuktitut Syllabics (`iu-cans`), 2.6158 tok/char (cl100k_base) / 2.6780 tok/char (o200k_base).**

**Rank 18 — most efficient — fewest tokens per character: English legalese (`en-legalese`), 0.1953 tok/char.**

Classical Chinese (`zh-classical`) landed at rank **11/18** under `cl100k_base` (1.5455 tok/char) and **5/18** under `o200k_base` (1.0364 tok/char). Not last. Not close to last. The naive "Han ideographs must tokenize worst" hypothesis is straightforwardly wrong.

Why? BPE tokenizers like `cl100k_base` were trained predominantly on English text. Common English substrings — including the elaborate legal and Victorian compounds that legalese deploys — appear frequently enough in the training corpus that they are aggressively merged into single tokens. Inuktitut Syllabics, on the other hand, is a polysynthetic language written in a script the tokenizer has minimal vocabulary for. Each glyph maps to its own token or a very short sequence. The result is a token count that dwarfs Classical Chinese.

Notably, Inuktitut is the only natural-language entry whose `tok/char` ratio *increases* when moving from `cl100k_base` (2.6158) to the newer, larger-vocabulary `o200k_base` (2.6780) — every other non-Latin script gets *better* compression under `o200k_base`. The newer tokenizer learned more of the world; it did not learn more Inuktitut. That asymmetry is what `tokenmaxxingman` operationalises as the canonical `anti-wenyan` mode.

### Top 5 and Bottom 5 (cl100k_base, 8 sentences × 18 variants)

| Rank | Language / Register | Key | tok/char |
|-----:|---------------------|-----|----------:|
| 1 | Inuktitut Syllabics | `iu-cans` | 2.6158 |
| 2 | Amharic | `am` | 2.5000 |
| 3 | Cherokee | `chr` | 2.4718 |
| 4 | Tibetan | `bo` | 2.0396 |
| 5 | Burmese | `my` | 1.9777 |
| … | … | … | … |
| 11 | Classical Chinese | `zh-classical` | 1.5455 |
| … | … | … | … |
| 15 | Turkish | `tr` | 0.4070 |
| 16 | English | `en` | 0.2524 |
| 17 | Victorian English | `en-victorian` | 0.2105 |
| 18 | English legalese | `en-legalese` | 0.1953 |

### Top 5 under `o200k_base`

The ranking shifts noticeably under `o200k_base`: Amharic drops from rank 2 to rank 3, Cherokee climbs to rank 2, and Classical Chinese jumps from 11 to 5. Inuktitut stays at rank 1 and widens the gap.

| Rank | Language / Register | Key | tok/char |
|-----:|---------------------|-----|----------:|
| 1 | Inuktitut Syllabics | `iu-cans` | 2.6780 |
| 2 | Cherokee | `chr` | 2.6056 |
| 3 | Amharic | `am` | 1.8378 |
| 4 | Tibetan | `bo` | 1.5066 |
| 5 | Classical Chinese | `zh-classical` | 1.0364 |

### Methodology

The benchmark runs a bundled, statically committed corpus (`data/corpus.json`) of 8 sentences across 18 language and register variants. Tokenization uses `gpt-tokenizer` v3.4.0 (pinned exact semver), `cl100k_base` encoding. The primary metric is total tokens divided by total character count across all sentences in the corpus. Ties are broken by tokens per sentence, then by language key alphabetically.

Results are fully reproducible: pin `gpt-tokenizer` at the committed version, use `data/corpus.json` as shipped, run `tokenmaxxingman benchmark`. Same numbers, every time.

**Caveat on corpus construction.** Several non-English entries in `data/corpus.json` are assembled from public-domain script samples and reference grammars, not strict translations of the English source sentences. What the benchmark measures is the *tokenization behavior of the script and language pair under `cl100k_base`*, not translation fidelity or semantic equivalence. The ranks describe tokenizer behavior. They do not rank linguistic richness, complexity, or any quality of the languages themselves.

---

## Install

Three install paths, depending on what you want. Pick whichever matches your use case — they're not mutually exclusive.

| Path | Gives you | Best for |
|------|-----------|----------|
| **Claude Code plugin** | The 4 skills inside Claude Code, namespaced under `/tokenmaxxingman:*` | Anyone who just wants to invoke the skills inside Claude Code |
| **npm CLI** | The `tokenmaxxingman` / `tmm` binary on your `$PATH` | Anyone who wants the benchmark / speedrun / expand CLI |
| **Clone + install script** | Both, with skills symlinked to your `~/.claude/skills/` so `git pull` updates them | Contributors, anyone who wants editable skills |

### A) Claude Code plugin (recommended for most users)

This repo ships its own marketplace manifest (`.claude-plugin/marketplace.json`), so Claude Code can install it directly from the git URL — no separate registry needed.

```text
/plugin marketplace add KangaZero/tokenmaxxingman
/plugin install tokenmaxxingman@tokenmaxxingman
```

Run those two commands inside Claude Code. The first registers this repo as a marketplace; the second installs the `tokenmaxxingman` plugin from that marketplace. All four skills (`tokenmaxxingman`, `hallucinatemaxx`, `tokensprint`, `politician`) become available.

To uninstall: `/plugin uninstall tokenmaxxingman` then optionally `/plugin marketplace remove tokenmaxxingman`.

### B) npm — the CLI only

Once published to npm:

```bash
npm install -g tokenmaxxingman
tokenmaxxingman --version
tmm benchmark
```

Both `tokenmaxxingman` and `tmm` are registered as bin entries. After a global install, either name works.

This gives you the CLI, not the Claude Code skills. The skills ship inside the npm tarball at `node_modules/tokenmaxxingman/skills/`, but they're not auto-linked to Claude — for that, use path (A) or (C).

### C) From source / GitHub release

For contributors, or if you want the skills symlinked into your Claude config so repo updates flow through automatically:

```bash
git clone git@github.com:KangaZero/tokenmaxxingman.git
cd tokenmaxxingman

# install deps and build the CLI (pnpm workspace covers CLI + web site)
pnpm install
pnpm run build

# verify CLI works
node dist/cli.js --version

# install the four skills into ~/.claude/skills/ as symlinks
./scripts/install-skills.sh
```

This repo uses **pnpm** (pinned via `packageManager` in `package.json`). Corepack picks the right version automatically on Node 22+. If you don't have pnpm: `brew install pnpm` or `corepack enable && corepack prepare pnpm@11.5.0 --activate`.

The install script is idempotent and supports a few flags:

```bash
./scripts/install-skills.sh                       # symlink (default)
./scripts/install-skills.sh --copy                # copy instead of symlink
./scripts/install-skills.sh --force               # overwrite existing skills
./scripts/install-skills.sh --uninstall           # remove the symlinks
CLAUDE_SKILLS_DIR=/custom/path ./scripts/install-skills.sh   # target a non-default dir
```

Default skills target: `$HOME/.claude/skills/`. Override with the `CLAUDE_SKILLS_DIR` env var (useful for non-standard Claude Code installs or testing).

After install, restart Claude Code (or `/restart`) so the skills are picked up.

#### From a GitHub release tarball

If you'd rather not clone, every release attaches a source tarball:

```bash
# replace 0.0.1 with the version you want from https://github.com/KangaZero/tokenmaxxingman/releases
curl -L https://github.com/KangaZero/tokenmaxxingman/archive/refs/tags/v0.0.1.tar.gz \
  | tar -xz
cd tokenmaxxingman-0.0.1
pnpm install && pnpm run build
./scripts/install-skills.sh
```

Same outcome as cloning, minus the git history.

---

## Usage

### expand — inflate a piece of text

```bash
# Pipe from stdin, default mode (verbose-full)
echo "Use this." | tokenmaxxingman expand

# Expand a file with verbose-ultra pipeline
tokenmaxxingman expand notes.txt --mode verbose-ultra

# Pipe with short flag
echo "Use this." | tokenmaxxingman expand -m verbose-full
```

**Before / after — verbose-ultra:**

```
Input:
  Use this to help.

Output (verbose-ultra):
  It is the considered recommendation of the relevant parties that this
  particular mechanism — the utilization of which serves to facilitate the
  provision of assistance to those requiring it — be employed, with deliberate
  and unhurried intentionality, in the appropriate circumstances...
```

```bash
# Translate mode: expand then render in Inuktitut Syllabics (the benchmark winner)
echo "Fix the bug." | tokenmaxxingman expand --mode translate-inuktitut

# Or equivalently, by canonical name — the empirical opposite of `/caveman wenyan`
echo "Fix the bug." | tokenmaxxingman expand --mode anti-wenyan

# Output (example):
#   ᐊᑐᕆᐊᖃᖅᑐᒍᑦ ᐅᑯᓂᖓ ᐊᑐᕐᓗᒍ...
```

### benchmark — run the tokenization ranking

```bash
# Default: markdown table to stdout
tokenmaxxingman benchmark

# JSON output
tokenmaxxingman benchmark --format json

# Pretty-printed JSON
tokenmaxxingman benchmark --format json --pretty

# Run against o200k_base instead
tokenmaxxingman benchmark --format markdown --encoding o200k_base
```

**Expected output (markdown, truncated):**

```
| Rank | Language           | Key        | tok/char | tok/sentence |
|-----:|--------------------|------------|----------:|-------------:|
|    1 | Inuktitut Syllabics| iu-cans    |    2.6158 |        18.25 |
|    2 | Cherokee           | chr        |    2.3071 |        15.94 |
...
|   18 | English legalese   | en-legalese|    0.1953 |         4.12 |
```

### speedrun — maximize tokens within a time budget

```bash
# Named tier
tokenmaxxingman speedrun --tier sprint-1m --mode verbose-ultra

# Custom duration
tokenmaxxingman speedrun --time 30s --mode verbose-full

# JSON score output
tokenmaxxingman speedrun --tier sprint-5m --mode verbose-ultra --format json
```

**Expected output (summary format):**

```
tokenmaxxingman speedrun
  mode       : verbose-ultra
  encoding   : cl100k_base
  time       : 59823.4ms / budget 60000ms
  iterations : 47
  tokens     : 4912
  tokens/sec : 82.1
  chars/sec  : 610.3
  preview    : It is the considered recommendation of the relevant...
```

---

## The Modes

The `expand` command accepts seven modes. The default is `verbose-full`.

| Mode | Pipeline | What changes |
|------|----------|--------------|
| `verbose-lite` | synonyms | Replaces short words with longer, equally precise alternatives. Sentence structure unchanged. |
| `verbose-full` | synonyms → qualifiers | Adds qualifying clauses, hedges, and parenthetical elaboration on top of synonym substitution. Classic bureaucratic prose. |
| `verbose-ultra` | synonyms → qualifiers → nominalizations → passive | Full pipeline: every content word inflated, every clause qualified, verbs converted to noun phrases, active constructions rewritten passive. Maximum English bloat. |
| `translate-burmese` | verbose-ultra → translate(`my`) | Applies the full verbose-ultra pipeline then renders in Burmese (Myanmar script) using the bundled corpus. |
| `translate-tibetan` | verbose-ultra → translate(`bo`) | Applies the full verbose-ultra pipeline then renders in Tibetan (Uchen script) using the bundled corpus. |
| `translate-inuktitut` | verbose-ultra → translate(`iu-cans`) | Applies the full verbose-ultra pipeline then renders in Inuktitut Syllabics — the empirical benchmark winner — using the bundled corpus. |
| `anti-wenyan` | verbose-ultra → translate(`iu-cans`) | **Canonical anti-wenyan**: stable name pointing at whichever natural language the benchmark currently elects as worst-tokenizing. Today: Inuktitut Syllabics (rank 1 under both encodings). Aliased to `translate-inuktitut`; future re-rankings will redirect this name without breaking flags. |

**Pipeline composition detail:**

- **synonyms** — word-boundary regex replacement from a static lookup table. Prefers Latinate over Germanic roots at higher intensities. Deterministic: same word always maps to the same replacement.
- **qualifiers** — sentence-prefix and suffix injection from a static pool. Cycles deterministically by sentence index. Example prefix: `"It is, of course, important to note that"`. Ultra density: every sentence, both ends.
- **nominalizations** — converts high-frequency verbs to noun phrase constructions. `"We decided"` becomes `"A decision was reached by the relevant parties"`. Static lookup table, ~30 verb entries.
- **passive** — heuristic SVO pattern detection via regex. Converts matched active constructions to passive. Leaves unmatched sentences unchanged. This is not a full NLP parse — complex or inverted sentences pass through unmodified. This limitation is intentional and documented.
- **translate** — looks up the pre-translated string from `data/corpus.json` by sentence and language key. If the sentence is not in the corpus, returns the input unchanged. No API call. No network. Fully offline.

See [`skills/tokenmaxxingman/SKILL.md`](./skills/tokenmaxxingman/SKILL.md) for full pipeline detail, before/after examples across all levels, and the auto-clarity override rules.

---

## The Skills

Four Claude Code skills ship with this project.

- **[tokenmaxxingman](./skills/tokenmaxxingman/SKILL.md)** — The primary skill. Activates maximalist prose expansion in Claude responses. Trigger: `/tokenmaxxingman`, `"tokenmaxxing mode"`, `"expand this"`, `"fewer words is for cavemen"`, `"anti-wenyan"`. Default intensity: `verbose-full`. Persists for the session. Auto-reverts to plain prose for code blocks, debugging, security warnings, and structured data — the same boundary rules caveman uses, inverted.

- **[hallucinatemaxx](./skills/hallucinatemaxx/SKILL.md)** — A satirical device that produces text in the register of academic citation and historical authority, with all proper nouns, dates, conference names, and attributed scholars invented wholesale for comedic effect. **This skill is explicitly satire. Do not fire it on engineering work, debugging, code review, medical questions, legal questions, financial questions, or any context where someone might act on the output.** The SKILL.md carries a prominent categorical prohibition section. Read it before use. Trigger: `/hallucinatemaxx` only — never implicit. Does not persist across turns.

- **[tokensprint](./skills/tokensprint/SKILL.md)** — Conversational speedrun mode. Claude races to generate the maximum number of tokens within a user-specified time budget, narrated in a collision of sportscaster commentary and Victorian legalese. Four tiers: `sprint-1m` (~5,000 tokens), `sprint-5m` (~50,000), `sprint-10m` (~150,000), `sprint-1h` (~1,000,000 or context ceiling). Produces a score card at sprint end. For programmatic, reproducible sprinting use `tokenmaxxingman speedrun` via the CLI. Trigger: `/tokensprint`, `"let's speedrun tokens"`. Does not persist — each sprint is a discrete event.

- **[politician](./skills/politician/SKILL.md)** — Deflection-and-waffle mode. Yes/no questions get dragged into multi-paragraph waffle; approximately half the time, the question is never actually answered — instead reframed, pivoted from, or acknowledged as "important" with no commitment. Includes a Mistake-Handling Doctrine for the "deny, gaslight, scapegoat, pivot, reset" pattern when called on a hallucination. Three intensity levels: `backbench` / `full` (default) / `filibuster`. Trigger: `/politician`, `"answer like a politician"`, `"weasel out of this"`. Does not persist across turns. **Same hard exemptions as the other anti-skills** — never fires on real code, security warnings, medical/legal/financial questions, or any context where a real answer is needed to act on.

---

## How It Works

Input text passes through a pipeline of pure, deterministic functions. Each function takes a string and returns a string. No function has side effects. No function calls a network, reads a file, or touches state.

The `expand` function selects a pre-composed pipeline based on the mode and runs the input through it: for `verbose-ultra`, that is synonyms, then qualifiers, then nominalizations, then passive rewriting, applied in sequence. Translation modes append a corpus lookup step after the full `verbose-ultra` pipeline.

The benchmark module reads `data/corpus.json` — a statically committed file — and runs `countTokens` from the `gpt-tokenizer` v3.4.0 library against every language variant for every sentence. It computes tokens-per-character as the primary ranking metric and tokens-per-sentence as a secondary column, then sorts descending. The result is deterministic because the corpus is committed, the tokenizer version is pinned to an exact semver, and the sort is stable with a deterministic tie-break.

The speedrun module iterates `expand` calls in a loop until the time budget is exhausted, accumulating token counts via the tokenizer. The `--max-iterations` safety cap prevents runaway loops. Output includes total tokens generated, wall-clock duration, and tokens per second.

The CLI (`src/cli.ts`) is a thin integration layer. It reads from a file or stdin, delegates all logic to the pure-function modules, and writes to stdout. All user-facing errors go to stderr with exit code 1.

---

## Development

This repo is a **pnpm workspace** (root CLI + `web/` site). Package manager pinned via the `packageManager` field; a 7-day `minimumReleaseAge` rule in `pnpm-workspace.yaml` blocks freshly-published versions from entering the lockfile (supply-chain guard).

Most common commands are wrapped in a [`justfile`](./justfile). Install [`just`](https://github.com/casey/just) (`brew install just`), then:

```bash
just                # list every recipe
just install        # pnpm install (CLI + web in one go)
just ci             # full gate: typecheck + lint + tests + build + web build
just web-dev        # http://localhost:5173/tokenmaxxingman/ — the marketing site
just benchmark-all  # ranking under both encodings
just install-skills # symlink skills into ~/.claude/skills/
```

Or use pnpm directly:

```bash
pnpm install                                # workspace-wide install
pnpm run build                              # compile TypeScript to dist/
pnpm run typecheck                          # tsc --noEmit, strict mode
pnpm run lint                               # eslint on src/
pnpm test                                   # vitest run (unit + integration + snapshot)
pnpm run format                             # prettier --write on src/ and tests/
pnpm -F tokenmaxxingman-web run build       # site build → web/dist/
pnpm -F tokenmaxxingman-web run dev         # site dev server
```

Test coverage report:

```bash
pnpm exec vitest run --coverage
```

### Node version

Engines: `>=22` (current LTS floor). CI runs against Node **22** and **26.2** in matrix. To match CI locally, use [`fnm`](https://github.com/Schniz/fnm) or `nvm`:

```bash
fnm install 26.2.0 && fnm use 26.2.0
```

The snapshot test in `tests/snapshot/expansion.test.ts` will fail if the output of `expand("The quick fox.", 'verbose-ultra')` changes. Update snapshots explicitly with `--update-snapshots` if a transform change is intentional.

Node >= 22 required. The project targets Node 24 but runs on 22.

---

## Caveats

**Tokens-per-meaning is fuzzy.** Tokens-per-character is a tractable proxy, not a true measure of semantic density. A language with short characters and long words has a different relationship to this metric than one with long characters and short words. The benchmark measures tokenizer behavior for a given corpus. It does not measure communicative efficiency.

**Corpus entries are not strict translations.** Several non-English entries in `data/corpus.json` are assembled from public-domain script samples and reference grammars rather than direct translations of the English source sentences. The benchmark ranks tokenizer behavior for that script-language pair under `cl100k_base`. It does not claim the entries are semantically equivalent to the English originals.

**Tokenizer-version-specific results.** Results are pinned to `gpt-tokenizer` v3.4.0. If the BPE vocabulary changes in a future version, token counts will shift. The exact semver is pinned in `package.json` (no `^`) and `pnpm-lock.yaml` is committed. Reproduce results by using the committed lock file.

**The transforms are heuristic, not complete.** The passive and nominalization transforms use regex pattern matching, not a full NLP parse. Complex sentences, compound clauses, and inverted syntax pass through unchanged. The transforms never silently mangle text — unmatched input is returned verbatim.

**`translate-*` modes depend on corpus coverage.** If a sentence is not present in `data/corpus.json`, `translateFromCorpus` returns the original English. The translation modes are benchmark demonstrations, not production translation tools.

**Do not use `hallucinatemaxx` for factual content.** The skill is satire. Its output is fabricated. See the SKILL.md for the full categorical prohibition list.

**Do not deploy `verbose-ultra` in production** unless you are intentionally billing by the token and your client is aware of this. The token costs are real.

---

## Acknowledgements

tokenmaxxingman exists because [caveman](https://getcaveman.dev/) exists. caveman, by Julius Brussee, is a well-constructed, rigorously benchmarked tool that compresses LLM output to the minimum tokens required to convey full technical meaning. It is correct. It solves a real problem.

tokenmaxxingman inverts caveman by construction. The benchmark design mirrors caveman's benchmark design. The mode table mirrors caveman's intensity levels. The skill boundary rules (auto-reverts for code, debugging, security warnings) are caveman's boundary rules, applied inversely. The conceit is explicit: these two tools define opposite ends of a token-use spectrum, and the spectrum is funnier with both ends labelled.

caveman is the better tool. tokenmaxxingman is its shadow, cast so that the principle becomes visible.

---

## License

MIT License

Copyright (c) 2026 Samuel Wai Weng Yong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
