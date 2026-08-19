# tokenmaxxingman

[![Vibe Coded](https://img.shields.io/badge/vibe_coded-%F0%9F%A4%96_AI_slop_certified-ff3d00?style=flat-square&labelColor=0a0a0a)](https://github.com/KangaZero/tokenmaxxingman)
[![npm version](https://img.shields.io/npm/v/tokenmaxxingman?style=flat-square&labelColor=0a0a0a&color=ff3d00)](https://www.npmjs.com/package/tokenmaxxingman)

> A deliberately maximalist token-expenditure toolkit, and a rigorous tokenization benchmark. We do not save tokens. We squander them, with intention.

**🌐 Site:** [kangazero.github.io/tokenmaxxingman](https://kangazero.github.io/tokenmaxxingman/) · **📦 npm:** [`tokenmaxxingman`](https://www.npmjs.com/package/tokenmaxxingman) · **🔌 Plugin:** `KangaZero/tokenmaxxingman`

---

## Why

Tokens are a measurable resource. Most tooling treats that measurement as a budget to be minimised. tokenmaxxingman starts from the premise that tokens are a quantity to be spent without restraint — deterministically, reproducibly, and with real measurement behind it.

The reference point is the **token floor of plain prose**: the cost of saying a thing once, in ordinary English, with no elaboration. The bundled benchmark measures that floor directly, across eighteen language and register variants, and every expand mode is reported as a multiple of it. Nothing here is calibrated against any other tool. The corpus is the ruler.

The joke is real engineering. Tokenizer versions are pinned to an exact semver. The corpus is statically committed. The transforms are pure, deterministic functions under full test coverage. An absurdist premise executed with rigor is funnier than one that merely waves at the joke.

---

## The Empirical Finding

The primary metric is **tokens per word** (`tok/word`), measured using `Intl.Segmenter` with per-language locale awareness so that CJK, Indic, and syllabic scripts are word-segmented correctly rather than split on whitespace alone.

On the bundled 8-sentence × 18-language/register corpus, `cl100k_base` encoding, `gpt-tokenizer` v3.4.0:

**Rank 1 — most tokens per word — the benchmark winner: Inuktitut Syllabics (`iu-cans`), 21.05 tok/word (cl100k_base) / 21.55 tok/word (o200k_base).**

**Rank 18 — fewest tokens per word: English legalese (`en-legalese`), 1.20 tok/word.**

Why Inuktitut? It is polysynthetic — a single word encodes what English needs an entire clause to say. The 8-sentence corpus produces only 22 Inuktitut word-segments, but 463 tokens: each word costs ~21 tokens on average. That is a structural property of the language, not just the script.

The Dravidian and South Asian scripts (Telugu, Georgian, Malayalam, Tamil, Sinhala) cluster in ranks 2–9. They have complex morphology and are poorly represented in BPE training data — each word is long, unfamiliar to the tokenizer, and gets fragmented into many subword pieces.

Finnish and Turkish (agglutinative) land in the middle of the pack. Their words are long compound forms, but the segmenter counts each compound as one word — so `tok/word` is moderate even though `tok/char` is low. This illustrates why `tok/word` and `tok/char` tell different stories: `tok/char` measures script density; `tok/word` measures tokenizer cost per unit of meaning.

Inuktitut is the only natural-language entry whose ratio *increases* when moving from `cl100k_base` to the newer `o200k_base` — every other script improves. The newer tokenizer learned more of the world; it did not learn more Inuktitut.

### Top 5 and Bottom 5 (cl100k_base, 8 sentences × 18 variants)

| Rank | Language / Register | Key | tok/word | tok/char |
|-----:|---------------------|-----|----------:|---------:|
| 1 | Inuktitut Syllabics | `iu-cans` | 21.0455 | 2.6158 |
| 2 | Telugu | `te` | 13.3667 | 1.7665 |
| 3 | Georgian | `ka` | 13.0333 | 1.8357 |
| 4 | Cherokee | `chr` | 13.0000 | 2.4718 |
| 5 | Malayalam | `ml` | 12.9643 | 1.6351 |
| … | … | … | … | … |
| 14 | Turkish | `tr` | 2.7000 | 0.4070 |
| 15 | Modern Chinese | `zh-modern` | 2.4054 | 1.3692 |
| 16 | English | `en` | 1.2619 | 0.2524 |
| 17 | Victorian English | `en-victorian` | 1.2330 | 0.2105 |
| 18 | English legalese | `en-legalese` | 1.2023 | 0.1953 |

### Top 5 under `o200k_base`

Under `o200k_base`, Inuktitut widens its lead, Cherokee climbs to rank 2, and the Dravidian scripts compress more aggressively (the larger vocabulary covers more of their script). Classical Chinese drops out of the top 5 entirely.

| Rank | Language / Register | Key | tok/word | tok/char |
|-----:|---------------------|-----|----------:|---------:|
| 1 | Inuktitut Syllabics | `iu-cans` | 21.5455 | 2.6780 |
| 2 | Cherokee | `chr` | 13.7037 | 2.6056 |
| 3 | Amharic | `am` | 8.5000 | 1.8378 |
| 4 | Tibetan | `bo` | 5.8966 | 1.5066 |
| 5 | Tamil | `ta` | 3.6429 | 0.4378 |

### Methodology

The benchmark runs a bundled, statically committed corpus (`data/corpus.json`) of 8 sentences across 18 language and register variants. Tokenization uses `gpt-tokenizer` v3.4.0 (pinned exact semver), `cl100k_base` encoding. The primary metric is **tokens per word** (`tok/word`): total tokens divided by total word-segment count across all corpus sentences, where word segments are computed with `Intl.Segmenter` at `granularity: 'word'` (filtering to `isWordLike` segments, which excludes punctuation). The locale tag for each language is passed to the segmenter where it is a valid BCP 47 tag; non-standard codes (e.g. `zh-classical`) fall back to the runtime default. Secondary sort key is `tok/char`; tertiary is `tok/sent`; final tiebreak is language code alphabetically.

Results are fully reproducible: pin `gpt-tokenizer` at the committed version, use `data/corpus.json` as shipped, run `tokenmaxxingman benchmark`. Same numbers, every time.

**Caveat on corpus construction.** Several non-English entries in `data/corpus.json` are assembled from public-domain script samples and reference grammars, not strict translations of the English source sentences. What the benchmark measures is the *tokenization behavior of the script and language pair under `cl100k_base`*, not translation fidelity or semantic equivalence. The ranks describe tokenizer behavior. They do not rank linguistic richness, complexity, or any quality of the languages themselves.

---

## Install

Four paths, depending on what you want. Pick whichever matches your use case — they're not mutually exclusive. The first three are covered below; the MCP server has its own [section](#mcp-server).

| Path | Gives you | Best for |
|------|-----------|----------|
| **Claude Code plugin** | The 8 skills inside Claude Code, namespaced under `/tokenmaxxingman:*` | Anyone who just wants to invoke the skills inside Claude Code |
| **npm / pnpm / bun CLI** | The `tokenmaxxingman` / `tmm` binary on your `$PATH` (or run once with `npx` / `pnpm dlx` / `bunx`) | Anyone who wants the benchmark / speedrun / expand CLI |
| **Clone + install script** | Both, with skills symlinked to your `~/.claude/skills/` so `git pull` updates them | Contributors, anyone who wants editable skills |
| **MCP server** | The `tmm-mcp` stdio server — seven tools, eighteen resources, eight prompts — registered with any MCP client | Anyone who wants their agent to *measure* tokens rather than estimate them (see [MCP server](#mcp-server)) |

### A) Claude Code plugin (recommended for most users)

This repo ships its own marketplace manifest (`.claude-plugin/marketplace.json`), so Claude Code can install it directly from the git URL — no separate registry needed.

```text
/plugin marketplace add KangaZero/tokenmaxxingman
/plugin install tokenmaxxingman@tokenmaxxingman
```

Run those two commands inside Claude Code. The first registers this repo as a marketplace; the second installs the `tokenmaxxingman` plugin from that marketplace. All eight skills (`tokenmaxxingman`, `hallucinatemaxx`, `tokensprint`, `politician`, `okay-boomer`, `consultant`, `yolo`, `auto`) become available.

To uninstall: `/plugin uninstall tokenmaxxingman` then optionally `/plugin marketplace remove tokenmaxxingman`.

### B) npm / pnpm / bun — the CLI only

Published at [`npmjs.com/package/tokenmaxxingman`](https://www.npmjs.com/package/tokenmaxxingman). Install the `tokenmaxxingman` / `tmm` binary globally with whichever package manager you use:

```bash
npm install -g tokenmaxxingman
pnpm add -g tokenmaxxingman
bun add -g tokenmaxxingman
```

Or run it once, without installing anything:

```bash
npx tokenmaxxingman benchmark
pnpm dlx tokenmaxxingman benchmark
bunx tokenmaxxingman benchmark
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

# install the eight skills into ~/.claude/skills/ as symlinks
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
# replace 0.1.0 with the version you want from https://github.com/KangaZero/tokenmaxxingman/releases
curl -L https://github.com/KangaZero/tokenmaxxingman/archive/refs/tags/v0.1.0.tar.gz \
  | tar -xz
cd tokenmaxxingman-0.1.0
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

# Or equivalently, by canonical name — `maxlang` tracks whichever language the benchmark ranks 1
echo "Fix the bug." | tokenmaxxingman expand --mode maxlang

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

The `expand` command accepts eight modes. The default is `verbose-full`.

| Mode | Pipeline | What changes |
|------|----------|--------------|
| `verbose-lite` | synonyms | Replaces short words with longer, equally precise alternatives. Sentence structure unchanged. |
| `verbose-full` | synonyms → qualifiers | Adds qualifying clauses, hedges, and parenthetical elaboration on top of synonym substitution. Classic bureaucratic prose. |
| `verbose-ultra` | synonyms → qualifiers → nominalizations → passive | Full pipeline: every content word inflated, every clause qualified, verbs converted to noun phrases, active constructions rewritten passive. Maximum English bloat. |
| `verbose-galactic` | synonyms → code-switching → qualifiers → nominalizations → reduplication → rhetorical questions → passive | Every English-side amplifier at once: Latin and French code-switching, reduplicated noun phrases, mid-sentence rhetorical interjections, and passive voice over the top. The most extreme English-only mode — everything short of leaving the language. |
| `translate-burmese` | verbose-ultra → translate(`my`) | Applies the full verbose-ultra pipeline then renders in Burmese (Myanmar script) using the bundled corpus. |
| `translate-tibetan` | verbose-ultra → translate(`bo`) | Applies the full verbose-ultra pipeline then renders in Tibetan (Uchen script) using the bundled corpus. |
| `translate-inuktitut` | verbose-ultra → translate(`iu-cans`) | Applies the full verbose-ultra pipeline then renders in Inuktitut Syllabics — the empirical benchmark winner — using the bundled corpus. |
| `maxlang` | verbose-ultra → translate(`iu-cans`) | **The canonical maximiser**: a stable name for whichever natural language the bundled benchmark currently ranks first on tokens-per-word, with tokens-per-character as the tiebreak. Today that is Inuktitut Syllabics, which leads on both — 21.0455 tok/word and 2.6158 tok/char under `cl100k_base`, 21.5455 and 2.6780 under `o200k_base` — so `maxlang` resolves to `translate-inuktitut`. A future re-ranking redirects the name without breaking anybody's flags. |

> **Deprecated alias.** `anti-wenyan` was the former name of `maxlang` and still resolves to the identical pipeline. It is retained for compatibility with `0.0.21` and earlier, and is scheduled for removal in `1.0`. New invocations should use `maxlang`.

**Pipeline composition detail:**

- **synonyms** — word-boundary regex replacement from a static lookup table. Prefers Latinate over Germanic roots at higher intensities. Deterministic: same word always maps to the same replacement.
- **qualifiers** — sentence-prefix and suffix injection from a static pool. Cycles deterministically by sentence index. Example prefix: `"It is, of course, important to note that"`. Ultra density: every sentence, both ends.
- **nominalizations** — converts high-frequency verbs to noun phrase constructions. `"We decided"` becomes `"A decision was reached by the relevant parties"`. Static lookup table, ~30 verb entries.
- **passive** — heuristic SVO pattern detection via regex. Converts matched active constructions to passive. Leaves unmatched sentences unchanged. This is not a full NLP parse — complex or inverted sentences pass through unmodified. This limitation is intentional and documented.
- **code-switching** — appends a Latin, French, or German parenthetical gloss to a closed set of English connectives (`however`, `therefore`, `of course`). Each gloss is a fully-formed parenthetical, so the later passive and qualifier passes cannot fragment it. `verbose-galactic` only.
- **reduplication** — doubles or triples adjectives and intensifiers from a static lookup, hyphenated (`big` → `big-big-big`). Runs before the passive transform so the doubled forms survive the SVO rewrite. `verbose-galactic` only.
- **rhetorical questions** — inserts a hedged interrogative aside at roughly the midpoint of every even-indexed sentence, drawn from a fixed pool by sentence index. Odd-indexed sentences are left alone so the cadence does not become entirely monotonous. `verbose-galactic` only.
- **translate** — looks up the pre-translated string from `data/corpus.json` by sentence and language key. If the sentence is not in the corpus, returns the input unchanged. No API call. No network. Fully offline.

See [`skills/tokenmaxxingman/SKILL.md`](./skills/tokenmaxxingman/SKILL.md) for full pipeline detail, before/after examples across all levels, and the auto-clarity override rules.

---

## MCP server

The package ships an MCP server. **MCP** — the Model Context Protocol — is the open JSON-RPC standard by which an AI client calls tools, reads resources, and loads prompts from a separate server process. This one is built on `@modelcontextprotocol/sdk` v1.30.0 and speaks stdio.

### Why it exists

Until now the skills did their arithmetic in their heads. A skill asked to report an inflation ratio *estimated* the token count. A skill asked to render `maxlang` *approximated* the transform from the examples in its own manifest. The results were plausible and not reproducible, which is precisely the wrong way round for a project whose entire claim is measurement.

With the server registered, the skills call the same deterministic pipeline the CLI calls. `count_tokens` returns a real `gpt-tokenizer` count against a pinned vocabulary. `expand_text` returns the actual output of the actual transform, byte for byte, on every invocation. The ratio is measured rather than asserted, which is a modest improvement in institutional credibility for a tool of this kind.

### Install / register

```bash
# Claude Code (recommended)
claude mcp add tokenmaxxingman -- npx -y tokenmaxxingman tmm-mcp

# or globally installed
npm i -g tokenmaxxingman && claude mcp add tokenmaxxingman -- tmm-mcp
```

For a project-scoped registration that every contributor inherits from the repository, commit an `.mcp.json` at the project root. In a consuming project, point it at the published package:

```json
{
  "mcpServers": {
    "tokenmaxxingman": {
      "command": "npx",
      "args": ["-y", "tokenmaxxingman", "tmm-mcp"]
    }
  }
}
```

This repository ships its own `.mcp.json`, and it deliberately does not use that form. It points at the local build instead:

```json
{
  "mcpServers": {
    "tokenmaxxingman": {
      "command": "node",
      "args": ["dist/mcp/bin.js"]
    }
  }
}
```

A contributor working on the server should be testing the server they just edited, not the last version somebody published. The consequence is that `pnpm build` must have run at least once before the entry resolves — `dist/` is not committed — and must run again after every change to `src/mcp/`. If the client reports that the server failed to start, this is the first thing to check.

Two bin entries start the same server: `tmm-mcp` and `tokenmaxxingman-mcp`. The transport is stdio in both cases — the client spawns the process and speaks JSON-RPC over its standard input and output. There is no port to allocate, no daemon to supervise, and nothing left running once the client exits.

### Tools

| Tool | Params | Returns |
|---|---|---|
| `expand_text` | `text`, `mode`, `encoding?`, `locale?` | expanded text, before/after token counts, inflation ratio |
| `maxx_text` | `text`, `targetLanguage?`, `paddingMultiplier?`, `passes?` (1-5), `encoding?`, `locale?` | maximally inflated text, token counts, ratio |
| `count_tokens` | `text`, `encoding?`, `locale?` | tokens, characters, bytes, words, tokens/char, tokens/word |
| `benchmark_languages` | `encoding?`, `limit?`, `format?` (`markdown`\|`json`) | the bundled corpus ranked by tokens-per-word, with tokens-per-character as the tiebreak |
| `plan_speedrun` | `tier` or `durationMs`, `seed?`, `encoding?` | time budget, target token count, pacing plan |
| `list_modes` | — | every expand mode, language code, and time tier |
| `get_skill` | `name`, `section?` (`skill`\|`examples`) | raw SKILL.md / EXAMPLES.md text |

`mode` accepts `verbose-lite`, `verbose-full`, `verbose-ultra`, `verbose-galactic`, `translate-burmese`, `translate-tibetan`, `translate-inuktitut`, and `maxlang` — plus `anti-wenyan`, the deprecated alias of `maxlang`. `encoding` accepts `cl100k_base` (the default) or `o200k_base`.

Two optional parameters are easy to overlook and worth stating plainly. `locale` is a BCP-47 language tag (`iu-Cans`, for example) used for word segmentation via `Intl.Segmenter`; it changes the word count, and therefore tokens-per-word, and never changes the token count. `seed` on `plan_speedrun` is a piece of starting text used to estimate the tokens produced per iteration: supply it and the plan additionally reports `seedTokens` and `estimatedIterations`, omit it and both are `null` while the budget, target, and checkpoints are returned regardless.

### Resources

Every skill manifest is exposed as a readable resource, so a client can consult the mode definition without the skill files installed locally:

- `skill://<name>/SKILL.md` and `skill://<name>/EXAMPLES.md`, for each of the eight skills — `auto`, `consultant`, `hallucinatemaxx`, `okay-boomer`, `politician`, `tokenmaxxingman`, `tokensprint`, `yolo`.
- `benchmark://cl100k_base` and `benchmark://o200k_base` — the full ranked corpus result under each vocabulary.

### Prompts

One MCP prompt per skill, named after the skill. Loading the `politician` prompt puts a client into that register with nothing installed on disk, which is useful for clients that implement MCP prompts but not Claude Code skills.

### A worked example

Round numbers below are illustrative. Run it yourself for the real ones; that is rather the point of the server existing.

```text
→ count_tokens { "text": "Fix the bug." }
← { "tokens": 4, "characters": 12, "bytes": 12, "words": 3, "tokensPerCharacter": 0.3333, "tokensPerWord": 1.3333 }

→ expand_text { "text": "Fix the bug.", "mode": "maxlang" }
← { "mode": "maxlang", "canonicalMode": "maxlang", "output": "ᐊᑐᕆᐊᖃᖅᑐᒍᑦ ᐅᑯᓂᖓ …",
    "before": { "tokens": 4, … }, "after": { "tokens": 128, … },
    "inflation": { "tokenRatio": 32.0, "characterRatio": 4.08, "tokensAdded": 124 } }

→ count_tokens { "text": "ᐊᑐᕆᐊᖃᖅᑐᒍᑦ ᐅᑯᓂᖓ …" }
← { "tokens": 128, "characters": 49, "bytes": 147, "words": 6, "tokensPerCharacter": 2.6122, "tokensPerWord": 21.3333 }
```

The third call is the interesting one: the client can independently verify the ratio the second call reported, against the same pinned vocabulary, without taking the server's arithmetic on trust.

### Safety

The server reads and computes. It does not write files, spawn child processes, or make network calls. The corpus (`data/corpus.json`) and both BPE vocabularies ship inside the package at pinned versions, so every tool resolves offline and returns the same answer on every machine, in every session, indefinitely.

---

## The Skills

Eight Claude Code skills ship with this project — five prose modes (`tokenmaxxingman`, `hallucinatemaxx`, `tokensprint`, `politician`, `consultant`), a deprecated-code mode (`okay-boomer`), and two workflow utilities (`yolo`, `auto`).

- **[tokenmaxxingman](./skills/tokenmaxxingman/SKILL.md)** — The primary skill. Activates maximalist prose expansion in Claude responses. Trigger: `/tokenmaxxingman`, `"tokenmaxxing mode"`, `"expand this"`, `"maxlang"`. Default intensity: `verbose-full`. Persists for the session. Auto-reverts to plain prose for code blocks, debugging, security warnings, and structured data — verbosity is the product, but not at the cost of an answer somebody has to act on.

- **[hallucinatemaxx](./skills/hallucinatemaxx/SKILL.md)** — A satirical device that produces text in the register of academic citation and historical authority, with all proper nouns, dates, conference names, and attributed scholars invented wholesale for comedic effect. **This skill is explicitly satire. Do not fire it on engineering work, debugging, code review, medical questions, legal questions, financial questions, or any context where someone might act on the output.** The SKILL.md carries a prominent categorical prohibition section. Read it before use. Trigger: `/hallucinatemaxx` only — never implicit. Does not persist across turns.

- **[tokensprint](./skills/tokensprint/SKILL.md)** — Conversational speedrun mode. Claude races to generate the maximum number of tokens within a user-specified time budget, narrated in a collision of sportscaster commentary and Victorian legalese. Four tiers: `sprint-1m` (~5,000 tokens), `sprint-5m` (~50,000), `sprint-10m` (~150,000), `sprint-1h` (~1,000,000 or context ceiling). Produces a score card at sprint end. For programmatic, reproducible sprinting use `tokenmaxxingman speedrun` via the CLI. Trigger: `/tokensprint`, `"let's speedrun tokens"`. Does not persist — each sprint is a discrete event.

- **[politician](./skills/politician/SKILL.md)** — Deflection-and-waffle mode. Yes/no questions get dragged into multi-paragraph waffle; approximately half the time, the question is never actually answered — instead reframed, pivoted from, or acknowledged as "important" with no commitment. Includes a Mistake-Handling Doctrine for the "deny, gaslight, scapegoat, pivot, reset" pattern when called on a hallucination. Three intensity levels: `backbench` / `full` (default) / `filibuster`. Trigger: `/politician`, `"answer like a politician"`, `"weasel out of this"`. Does not persist across turns. **Same hard exemptions as the other anti-skills** — never fires on real code, security warnings, medical/legal/financial questions, or any context where a real answer is needed to act on.

- **[okay-boomer](./skills/okay-boomer/SKILL.md)** — Deprecation mode (not a prose mode). Rewrites your code using abandoned patterns and dead APIs — `var`, `XMLHttpRequest`, callback pyramids, jQuery 1.x, LAMP-era PHP — accompanied by unsolicited commentary on why the old way was fine. Three intensities: `boomer-lite`, `boomer-full` (default), `boomer-ultra`. Trigger: `/okay-boomer`, `"old school"`, `"use deprecated"`. Never rewrites production-bound code unless explicitly asked.

- **[consultant](./skills/consultant/SKILL.md)** — Corporate-frameworks mode. Reframes every question as a strategic imperative and answers it with a 2×2 matrix, a RACI table, an OKR cascade, and a recommendation that synergistically aligns stakeholders across the value chain. Substance optional; frameworks mandatory. Three intensities: `associate`, `principal` (default), `partner`. Trigger: `/consultant`, `"consultant mode"`, `"wrap this in a framework"`. Same hard exemptions as the other anti-skills.

- **[auto](./skills/auto/SKILL.md)** — The Autonomy Inversion Protocol (not a prose mode). Reverses the operating model: the AI stops implementing and becomes the delegator, issuing work items with acceptance criteria and non-negotiable deadlines, chairing the standup, and returning your diffs with a numbered list of non-blocking concerns. The exact opposite of `/yolo`. Trigger: `/auto`, `"switch roles"`, `"you tell me what to do"`, `"delegate to me"`. Persists for the session. Off switches: `"stop auto"`, `"you do it"`.

- **[yolo](./skills/yolo/SKILL.md)** — Utility skill (not a prose mode). Opt-in auto-accept setup for agent CLIs. On invocation it detects the agent CLI you are *currently running inside* (via env vars) plus every supported CLI installed on PATH — **Claude Code** (`permissions.defaultMode = "bypassPermissions"` in `~/.claude/settings.json`), **Gemini CLI** (`--yolo`), **Codex** (`--dangerously-bypass-approvals-and-sandbox`), **Aider** (`--yes-always`) — then **asks before disabling that tool's confirmation prompts**. Backed by `skills/yolo/enable-yolo.sh` (run `--status` to inspect, `--current` to scope to the running CLI). Defaults to **no**, backs up config before editing, and refuses to run without an interactive terminal. **Security:** this removes the last guardrail between an agent and your filesystem/credentials/remotes — personal dev boxes only, never shared/prod/CI. Trigger: `/yolo`, `"enable yolo"`, `"auto accept all edits"`, `"bypass permissions"`. Never auto-enables; does not persist.

---

## How It Works

Input text passes through a pipeline of pure, deterministic functions. Each function takes a string and returns a string. No function has side effects. No function calls a network, reads a file, or touches state.

The `expand` function selects a pre-composed pipeline based on the mode and runs the input through it: for `verbose-ultra`, that is synonyms, then qualifiers, then nominalizations, then passive rewriting, applied in sequence. Translation modes append a corpus lookup step after the full `verbose-ultra` pipeline.

The benchmark module reads `data/corpus.json` — a statically committed file — and runs `countTokens` from the `gpt-tokenizer` v3.4.0 library against every language variant for every sentence. It ranks on tokens-per-word — the primary sort key — and falls back to tokens-per-character, then tokens-per-sentence, then the language code, to break ties; the three ratios are all reported as columns. `ka` (Georgian) therefore ranks below `te` (Telugu) despite the higher tokens-per-character, because Telugu costs more tokens per word. The result is deterministic because the corpus is committed, the tokenizer version is pinned to an exact semver, and the sort is stable with a deterministic tie-break.

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
pnpm test                                   # vitest run (unit + integration)
pnpm run format                             # prettier --write on src/ and tests/
pnpm -F tokenmaxxingman-web run build       # site build → web/dist/
pnpm -F tokenmaxxingman-web run dev         # site dev server
```

Test coverage report:

```bash
pnpm exec vitest run --coverage
```

### Node version

Engines: `>=22.12.0` (the LTS floor declared in `package.json`). CI runs against Node **22** and **26.2** in matrix; the release workflow publishes from **26.2**. To match CI locally, use [`fnm`](https://github.com/Schniz/fnm) or `nvm`:

```bash
fnm install 26.2.0 && fnm use 26.2.0
```

There is no committed snapshot file. The transforms are pure and deterministic, so a snapshot regression test remains a reasonable idea and is tracked as an outstanding item in `BUILD-SUMMARY.md`; the assertions currently live inline in the module tests instead.

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

Tokenization is performed by [`gpt-tokenizer`](https://www.npmjs.com/package/gpt-tokenizer), pinned at v3.4.0, which provides pure-TypeScript BPE implementations of the `cl100k_base` and `o200k_base` encodings. Those encodings are OpenAI's published BPE vocabularies. The merge tables are theirs; every rank this project reports is a direct consequence of them.

The central observation is not ours either, and predates the project: byte-pair encoding merges frequently occurring substrings, English is heavily over-represented in the corpora those merges were derived from, and so verbose English costs *fewer tokens per character* than Han ideographs do. Whichever way one expects that comparison to resolve, the tokenizer has already settled it. This project's only contribution is to measure it across eighteen language and register variants, under two vocabularies, and then commit the numbers so they can be checked.

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
