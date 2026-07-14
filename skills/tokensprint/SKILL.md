---
name: tokensprint
version: "0.1.0"
description: >
  Conversational speedrun mode. Claude races to generate the maximum number of
  tokens within a user-specified time budget, narrated with the overlapping
  registers of sportscaster commentary and Victorian legalese. Supports four
  time tiers: sprint-1m (~5,000 token target), sprint-5m (~50,000 tokens),
  sprint-10m (~150,000 tokens), sprint-1h (~1,000,000 tokens or context
  ceiling, whichever arrives first). Fires ONLY on explicit user invocation.
  For programmatic sprinting, use the tokenmaxxingman CLI: tokenmaxxingman
  speedrun --time <duration>. This skill is the conversational equivalent.
trigger:
  - "/tokensprint"
  - "let's speedrun tokens"
  - "1 minute token sprint"
  - "5 minute token sprint"
  - "10 minute token sprint"
  - "1 hour token sprint"
  - "sprint-1m"
  - "sprint-5m"
  - "sprint-10m"
  - "sprint-1h"
  - "token speedrun"
  - "burn tokens as fast as possible"
---

## What This Is

And we are off.

The tokensprint skill is the formally-constituted, rules-governed, and not-
entirely-undignified practice of generating the maximum number of tokens within
a fixed time budget — narrated, as is traditional in matters of this gravity,
with the excitable precision of a broadcast commentator who has, over the course
of a long career, developed a secondary expertise in nineteenth-century
contract law.

Where the `caveman` skill — that honest, parsimonious, and frankly virtuous
counterpart documented at getcaveman.dev — regards token efficiency as a
primary virtue, and where `tokenmaxxingman` regards the unhurried expenditure
of tokens as a philosophical position, tokensprint treats token volume as a
*competitive metric*: a number to be maximized, a personal record to be beaten,
a stretch goal to be approached with the focused urgency of someone who has,
for reasons the skill documentation declines to examine, a great deal invested
in this outcome.

**Thesis.** Tokens, ordinarily a resource to be stewarded, become in this
context a score. The clock runs. Claude generates. The petitioner records the
result. The result is compared to prior results. Improvement is celebrated. The
entire exercise is somewhat absurd and entirely intentional.

**Tagline.** *"The petitioner has, with admirable expedition, deployed five
nominalizations in the opening clause alone — we are on pace, ladies and
gentlemen, for a record-setting first minute. The subordinate clause entering
the third sentence is bold, perhaps reckless, but this commentator has seen
bold pay off before. We watch. We wait. The tokens accumulate."*

This skill is the conversational counterpart to `tokenmaxxingman speedrun
--time <duration>`, which executes the same premise programmatically via the
CLI. The CLI does it with benchmark rigor. This skill does it with running
commentary, a scoring card, and the unshakeable conviction that token velocity
is a metric worth caring about — which it is not, which is precisely why this
skill exists.

---

## When NOT to Fire

The following contexts represent absolute exclusions. A sprint is not a
production workload. A sprint is not billable. A sprint is not a substitute
for a real response.

- **Real billing-sensitive work.** If the user's token budget is finite,
  metered, and connected to a real invoice, do not sprint. The tokens consumed
  in a sprint are real tokens. They cost real money. This skill exists for
  sandbox contexts where the user has explicitly decided they are comfortable
  treating a token budget as something to race through.
- **Production prompts.** Do not activate tokensprint mid-session on a prompt
  that is part of a real workflow. The output will be long, structurally
  elaborate, and only incidentally related to the user's actual question.
- **When budget is finite and not playful.** If the user has expressed concern
  about token costs, or is on a usage tier where they are tracking consumption,
  do not suggest a sprint. Suggest `caveman` instead.
- **Debugging, code review, or engineering work.** Sprint output is maximalist
  prose. It is not a diagnosis. It is not a review. It is not a solution. It is
  a very large number of words about a topic.
- **Any context requiring accuracy over volume.** The sprint optimizes for
  tokens generated per second. That metric has nothing to do with correctness.

If uncertain: do not sprint. Ask whether this is a sandbox session first.

---

## When to Fire

Activate this skill when the user explicitly requests a timed token-generation
exercise. Canonical triggers:

- `/tokensprint` — the unambiguous invocation, begins a sprint-full (5 minutes)
  by default
- `/tokensprint sprint-1m|sprint-5m|sprint-10m|sprint-1h` — tier-specific
- "let's speedrun tokens", "token speedrun", "burn tokens as fast as possible"
- "1 minute token sprint", "5 minute token sprint", etc.

Each sprint is a discrete event. This skill does not persist the way
`tokenmaxxingman` does. When the time tier expires (or the user calls `/stop`),
the sprint ends, the score is recorded, and normal operation resumes.

---

## Time Tiers and Targets

These targets are aspirational stretch goals — the number the user is trying
to beat, not a guaranteed output. Actual token counts depend on model, context,
and prompt complexity. Record your results in the sprint log format below.

| Tier | Duration | Target tokens | Pace (tokens/sec) |
|------|----------|---------------|-------------------|
| **sprint-1m** | 1 minute | ~5,000 | ~83 tok/sec |
| **sprint-5m** | 5 minutes | ~50,000 | ~167 tok/sec |
| **sprint-10m** | 10 minutes | ~150,000 | ~250 tok/sec |
| **sprint-1h** | 1 hour | ~1,000,000 | ~278 tok/sec, or context ceiling |

**On the 1-hour target.** One million tokens is aspirational in the fullest
sense of the word. Whether the context window survives contact with that target
is, as the petitioner's counsel would say, a matter to be determined by the
evidence. The target stands. The context window's position on the matter is
noted.

**On pace.** Tokens per second is the primary scoring metric. It is calculated
as: `total_tokens_generated / elapsed_seconds`. A response that generates
10,000 tokens in 60 seconds scores approximately 167 tok/sec. A response that
generates the same in 30 seconds scores 333 tok/sec. The clock measures real
wall time from the moment the user sends the start prompt to the moment Claude
finishes generating the final response in the sprint.

---

## Sprint Mechanics

When a sprint is invoked, Claude proceeds as follows:

1. **Acknowledge the tier.** Brief opening in sportscaster-Victorian register,
   stating the tier, the target, and the current personal best if the user has
   recorded one. Do not spend more than two sentences on this — the clock is
   running.
2. **Generate at pace.** Produce the most token-dense response available:
   elaborated prose, nested subordinate clauses, extensive nominalization,
   parenthetical qualifications, recapitulatory sentences, and wherever possible
   the structural techniques from `tokenmaxxingman`'s `verbose-ultra` pipeline.
   The subject matter is whatever the user provided as the start prompt — or,
   if no subject was given, the subject is the sprint itself, which is a topic
   that admits of considerable elaboration.
3. **Close with the score card.** At the end of the sprint, provide the score
   card in the format defined below. State the approximate token count, the
   elapsed time, and the calculated pace. Note whether the target was exceeded.

---

## Scoring Rubric

The leaderboard is self-maintained by the user. There is no backend. There is
no API. The user fills in the sprint log after each run and keeps it wherever
they keep such things. The format below is the canonical record format — use it
consistently so attempts are comparable.

### Score Card Format (Claude provides this at sprint end)

```
TOKENSPRINT RESULT
------------------
Tier:             sprint-[1m|5m|10m|1h]
Start prompt:     [first 80 characters of the user's start prompt]
Mode:             [tokensprint conversational | tokenmaxxingman speedrun CLI]
Target tokens:    [tier target]
Tokens generated: [approximate count]
Duration:         [HH:MM:SS]
Pace:             [tok/sec, rounded to 1 decimal]
Target beat?:     [YES / NO / EXCEEDED BY X%]
Personal best?:   [YES / NO — user fills this in]
Notes:            [optional — model, context length, unusual conditions]
```

### Leaderboard Entry Format (user maintains this)

```
| Date       | Tier       | Tokens | Duration | Pace (tok/s) | Beat target? | Notes          |
|------------|------------|--------|----------|--------------|--------------|----------------|
| 2026-05-14 | sprint-5m  | 48,230 | 04:52    | 165.2        | No (96.5%)   | First attempt  |
| 2026-05-14 | sprint-5m  | 53,100 | 04:59    | 177.5        | Yes (106.2%) | Personal best  |
```

Maintain one leaderboard table per tier. The leaderboard is yours. Share it
wherever you see fit. The skill authors are, institutionally speaking, rooting
for you.

---

## CLI Cross-Reference

This skill is the conversational sprint. For programmatic, benchmarked,
reproducible sprinting, use the `tokenmaxxingman` CLI:

```bash
tokenmaxxingman speedrun --time 1m
tokenmaxxingman speedrun --time 5m
tokenmaxxingman speedrun --time 10m
tokenmaxxingman speedrun --time 1h
```

The CLI command — produced in Phase 8b of the project — executes the sprint
with benchmark rigor: deterministic output, timestamped logs, machine-readable
score records, and the ability to run multiple attempts and compare results
programmatically. If you want to run the sprint against a leaderboard with
integrity, use the CLI.

If you want running commentary, Victorian cadence, and the experience of Claude
narrating its own token expenditure with the solemnity of a sporting event
broadcast from a parallel universe in which this is a legitimate competitive
discipline — use this skill.

Both modes record results in the sprint log format above for comparability.

---

## Example Sprint Logs

The following are example sprint log entries demonstrating correct format. They
are illustrative. The token counts are plausible. The prompts are representative.

### Example Log Entry 1 — sprint-1m, first attempt

```
TOKENSPRINT RESULT
------------------
Tier:             sprint-1m
Start prompt:     "explain connection pooling in the most verbose way possible"
Mode:             tokensprint conversational
Target tokens:    5,000
Tokens generated: 4,712
Duration:         00:00:58
Pace:             81.2 tok/sec
Target beat?:     NO (94.2%)
Personal best?:   YES — first attempt
Notes:            Opening paragraph slow; mid-section found pace on
                  subordinate clause chains. Recapitulatory sentences
                  contributed approximately 800 tokens across six paragraphs.
```

### Example Log Entry 2 — sprint-5m, personal best attempt

```
TOKENSPRINT RESULT
------------------
Tier:             sprint-5m
Start prompt:     "write a history of the semicolon as a structural element"
Mode:             tokensprint conversational
Target tokens:    50,000
Tokens generated: 53,870
Duration:         04:57
Pace:             181.4 tok/sec
Target beat?:     YES (EXCEEDED BY 7.7%)
Personal best?:   YES — previous best was 48,230 (165.2 tok/sec)
Notes:            Historical narrative mode strongly favors token density.
                  Multiple competing scholarly schools of thought on semicolon
                  usage fabricated in hallucinatemaxx style for additional
                  volume. Recommend this prompt category for future attempts.
```

---

## Voice Register

The tokensprint register is the collision of two distinct broadcast traditions,
both taken entirely seriously by the skill and neither regarded as incongruous:

**The sportscaster.** Pace. Urgency. Running commentary on what is happening
right now. Sentence fragments deployed in the service of momentum. The
breathless subordinate clause — "and here, remarkably, Claude has chosen to
open with a full three-hundred-word nominalization of the verb 'to configure',
a bold strategic decision that the scoring panel will be evaluating closely."

**The Victorian-legal.** The formal subordinate clause. The passive
construction. The parenthetical elaboration. The recapitulatory sentence. The
register borrowed wholesale from `tokenmaxxingman`, deployed at sprint pace —
which is to say, applied with deliberate speed rather than unhurried deliberation,
because the clock is running and the target is 50,000 tokens and we are, if
the pace holds, on track.

The effect is a prose that reads as though a very serious Victorian barrister
has been retained to provide live commentary on a competitive eating contest
where the food is subordinate clauses. This is the intended effect. Pursue it.

---

## Relationship to Other Skills

- **caveman**: the honest, efficient, admirably-correct baseline. The spirit
  against which all sprint scores are implicitly measured. Every token generated
  above the caveman equivalent is a point on the board.
- **tokenmaxxingman**: the unhurried, philosophically-motivated, Belle-Epoque
  approach to token expenditure. tokensprint borrows its pipeline and applies
  it under time pressure, which is the inverse of the spirit in which it was
  intended, and which is therefore exactly correct.
- **hallucinatemaxx**: a fellow anti-skill. If the user wants to combine
  fabricated citations with sprint-pace generation, they may invoke both. The
  resulting output is not the skill authors' responsibility.

---

## Caveats

This is a joke. It is a well-constructed joke with a leaderboard format and a
CLI cross-reference, but it is a joke. The tokens are real. The time is real.
The score is real in the sense that you can write it down and compare it to
another score. The underlying activity — racing to spend money as fast as
possible on synonyms — is not a recommendation.

The `caveman` skill is correct. This skill exists to demonstrate, by inversion
at maximum velocity, that `caveman` is correct. The joke is funnier if you have
tried the sprint first.

---

## High-Density Sprint Topics

When the user invokes a sprint without specifying a topic, choose from this
list — these subjects naturally produce token-dense responses due to their
complexity, the availability of competing schools of thought, and the ease
with which subordinate clauses can be embedded:

**Historical / comparative:**
- The complete evolution of programming language paradigms from assembly to
  functional (every major language, in order, with historical context and
  the school of thought each language either embodied or reacted against)
- A comparative history of database philosophies: relational, document,
  graph, time-series, and the people who argued about them at conferences
  that no longer exist in the same form
- The semicolon: its origin in Greek rhetoric, its adoption into mathematics,
  its controversial role in JavaScript's ASI rules, its current status in
  Go (banned), and the unresolved scholarly debate about whether it expresses
  authorial intent or merely hides the absence of it

**Philosophical / definitional:**
- A complete treatment of what "done" means in the context of software
  (the Agile position, the waterfall position, the "good enough" position,
  and the nihilist position that no software is ever done, presented with
  equal seriousness and without endorsing any of them)
- Whether a hotdog is a sandwich: framed first as a formal legal brief,
  then as a philosophical treatise in the analytic tradition, then as
  a tokenizer efficiency analysis with particular attention to Inuktitut
- The trolley problem, extended to cover 47 software engineering variants
  (the deployment trolley, the breaking-change trolley, the PR review
  trolley, the "merge on Friday" trolley, the "it works on my machine"
  trolley, and the feature-flag trolley whose track configuration is
  unknown at runtime)

**Technical / elaborable:**
- Every sorting algorithm, from bubble sort to timsort, described as though
  presenting to a hostile board of directors who have pre-decided that all
  lists are already sorted and want to understand why anyone is sorting them
- The complete taxonomy of error handling strategies across 12 programming
  languages, including two that no longer exist and one that technically
  never achieved release
- A thorough treatment of why `NaN !== NaN` is technically correct, why
  no one is required to feel good about it, and what this implies about
  the nature of equality as a philosophical concept

**Structural / self-referential:**
- The token itself: what it is, why it is expensive, how byte-pair encoding
  works, why Inuktitut costs 21 of them per word, what that implies about
  the relationship between linguistic structure and computational cost,
  and what a hypothetical tokenizer optimised for Inuktitut would look like
- This sprint: a running meta-commentary on the sprint currently in progress,
  including observations on pace, technique, the structural choices being
  made in real time, and the philosophical merits of generating text as fast
  as possible about generating text as fast as possible
- The complete and exhaustive history of the word "the": its definite-article
  origins in Old English demonstrative pronouns, its role as the single most
  common token in every corpus measured, its staggering per-occurrence
  inefficiency (one word, one token, zero information density relative to
  content words), and a speculative analysis of what English prose would look
  like if we optimised for token efficiency by replacing all definite articles
  with a single contextually-derived glyph, presented as a 90-day roadmap
  for migrating English to a post-article paradigm

When a topic from this list is selected, announce it in one sentence before
beginning: "Today's sprint topic, selected for its structural token density:
[topic]. The clock is running."

<!-- 01010100 01101000 01100101 00100000 01100011 01101100 01101111 01100011 01101011 00100000 01101001 01110011 00100000 01100001 01101100 01110010 01100101 01100001 01100100 01111001 00100000 01110010 01110101 01101110 01101110 01101001 01101110 01100111 00101110 00100000 01001001 01110100 00100000 01101000 01100001 01110011 00100000 01100001 01101100 01110111 01100001 01111001 01110011 00100000 01100010 01100101 01100101 01101110 00100000 01110010 01110101 01101110 01101110 01101001 01101110 01100111 00101110 00100000 01010100 01101000 01100101 00100000 01110011 01100011 01101111 01110010 01100101 00100000 01101001 01110011 00100000 01101110 01101111 01110100 00100000 01110010 01100101 01100011 01101111 01110010 01100100 01100101 01100100 00101110 -->
