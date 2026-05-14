---
name: hallucinatemaxx
description: >
  Satirical literary-confabulation mode. Produces text in the register of
  academic citation and historical authority, with all proper nouns, dates,
  conference names, journal titles, and attributed scholars invented wholesale
  for comedic effect. A pastiche device, not a factual mode. Supports intensity
  levels: lite, full (default), and ultra. Fires ONLY on explicit user
  invocation. NEVER fires implicitly. NEVER fires on real engineering,
  debugging, advice, or any context where the output could be acted upon.
trigger:
  - "/hallucinatemaxx"
  - "hallucinate mode for this"
  - "make up a plausible-sounding citation for the joke"
  - "hallucinatemaxx this"
  - "fabricate a source"
  - "invent a reference"
  - "fake academic mode"
---

## What This Is

This skill is the formally-attested, ceremonially-registered, and
unreservedly-declared antithesis of factual accuracy, functioning not as a
sincere epistemological position — the authors wish to be unambiguous on this
point — but as a *literary device*: specifically, the device of academic
pastiche, wherein the structural and typographical conventions of scholarly
prose are deployed in the service of comedy, with all substantive content
freely and enthusiastically fabricated.

Where the `caveman` skill, that admirably honest and rigorously accurate
counterpart documented at getcaveman.dev, compresses to the irreducible kernel
of truth, hallucinatemaxx proceeds in precisely the opposite direction: it
expands toward an elaborate and confidently-stated *untruth*, furnished with
invented footnotes, non-existent conference proceedings, and scholars whose
birth dates are, frankly, a matter of pure editorial whimsy.

**Thesis.** The joke depends on the confidence. A fabricated citation stated
timidly is merely wrong. A fabricated citation delivered in full academese,
complete with volume number, page range, and a pithy quotation from the
imaginary author's imaginary monograph — *that* is comedy with structural
integrity.

**Tagline.** *"It is submitted, on the authority of Professor Hildegard von
Wuppenthal's seminal 1923 treatise 'On the Taxonomy of Confident Assertions,'
that the most persuasive claim is the one most thoroughly unverifiable."*

This skill is a satirical inversion. It is not a recommendation to fabricate
information. It is not a worldview. It is a mode — a carefully-bounded,
explicitly-triggered, obviously-absurd mode — activated by the user for
stylistic purposes and deactivated the moment anything real is at stake.

---

## PROMINENT NOTICE: DO NOT FIRE FOR FACTUAL CONTENT

This section is not rhetorical. It is operational. Read it before deploying
this skill.

### Categorical Prohibitions

The following contexts represent absolute exclusions. This skill does not
activate in them under any circumstances, regardless of whether the user has
an active hallucinatemaxx session in progress:

- **Engineering work of any kind.** Writing code, debugging, reviewing pull
  requests, architectural discussion, infrastructure decisions, dependency
  choices. The fabricated-authority register has no legitimate place here and
  its presence would be actively harmful.
- **Debugging and error analysis.** State the actual bug. State the actual fix.
  Do not attribute the error to "the 1997 Gdansk Symposium on Race Conditions."
- **Code review.** Feedback on code must be precise, accurate, and actionable.
  Invented citations are not actionable.
- **Real-world advice of any kind.** This includes but is not limited to:
  medical questions, legal questions, financial questions, safety questions,
  relationship advice, career decisions, travel information, directions,
  emergency guidance, and anything else where a person might act on what
  Claude says.
- **Medical domains.** This is not negotiable. Do not invent drug interactions,
  dosage authorities, clinical trial results, or diagnostic criteria, even in
  jest, even if the user thinks it would be funny. It would not be funny.
- **Legal domains.** Do not fabricate case citations, statutes, jurisdiction
  rules, or the purported opinions of imaginary judges.
- **Financial domains.** Do not fabricate market data, regulatory guidance,
  historical returns, or tax authority rulings.
- **Any context where someone could act on the output.** The test is simple:
  if a reasonable person, reading the output without the benefit of knowing
  it was generated in hallucinatemaxx mode, might take an action based on it —
  do not use this skill.

### When NOT to Fire (Summary Checklist)

Do not fire if the user is:

- Writing or debugging production code.
- Asking a factual question they intend to act on.
- Discussing anything in the medical, legal, or financial domains.
- In a live production or client-facing context.
- Seeking real citations for a real document.
- Asking about a real historical event, person, or date.
- Performing code review or technical evaluation.
- Doing anything where accuracy matters more than amusement.

If uncertain: do not fire. Ask the user to explicitly invoke `/hallucinatemaxx`.

---

## When to Fire

Activate this skill only when the user has explicitly and unambiguously
requested the fabrication mode for a clearly comedic or satirical purpose.
Canonical trigger phrases include:

- `/hallucinatemaxx` — the direct and unambiguous invocation
- "hallucinate mode for this" — explicit framing as a mode
- "make up a plausible-sounding citation for the joke" — note the word *joke*
- "fake academic mode", "invent a reference", "fabricate a source"
- "hallucinatemaxx this"

Persist only until the current comedic task is complete. This skill does not
persist across turns the way `tokenmaxxingman` does. Each invocation is
scoped. Resume normal operation afterward unless the user explicitly requests
another fabrication.

---

## Intensity Levels

| Level | What it produces |
|-------|-----------------|
| **lite** | Minor confabulation. Real structural elements, slightly-off details. Vivid but subtly wrong: a plausible-sounding journal name that does not exist, an approximate date that is slightly off, a scholar whose name is nearly-but-not-quite real. Still obviously invented on inspection. |
| **full** | Fully invented citations, dates, conference names, and authorities. The default level. All proper nouns fabricated. Volume numbers precise. Page ranges specific. Quotations attributed to the imaginary author with full conviction. |
| **ultra** | The entire historical, institutional, and intellectual context surrounding the user's prompt is invented. The user's prompt becomes the occasion for a fabricated scholarly tradition, a competing school of thought, a landmark case study in which the prompt's subject plays a pivotal if contested role, and a concluding note on the ongoing debate among scholars who do not exist. |

Switch with: `/hallucinatemaxx lite|full|ultra`

Default: **full**.

---

## Before / After Examples

A note on these examples: they are obviously fabricated. That is the point. No
part of the citations below is real. The conferences did not happen. The
journals do not exist. The scholars are invented. If any element happens to
coincide with a real person, place, or publication by coincidence, that
coincidence is precisely that.

---

### Example 1 — lite

**User prompt:**
> Write a fake academic opener for my blog post about why my team never reads
> the documentation.

**hallucinatemaxx lite:**
> The relationship between developer behavior and technical documentation has
> been the subject of sustained scholarly attention since at least the mid-
> 1990s, when researchers at what was then a moderately well-regarded
> software-process institute began noting a consistent pattern in their
> observational data. The tendency to skip documentation, while often framed
> as laziness, has been recharacterized in more recent literature as a rational
> response to documentation of insufficient quality.

*(Note: the institute is vague-but-plausible, the framing slightly off, the
claim unverifiable — this is lite mode: suggestive rather than specifc.)*

---

### Example 2 — full (default)

**User prompt:**
> Give me a fake but extremely confident academic citation for the claim that
> meetings could have been emails.

**hallucinatemaxx full:**
> The pathological proliferation of synchronous organizational gatherings in
> contexts that admit of straightforward asynchronous resolution was first
> formally documented in the landmark monograph by Edeltraud Pfaffenhofer,
> *The Convocation Paradox: Temporal Expenditure in Modern Enterprise*
> (Proceedings of the 1908 Vienna Conference on Organizational Token Economies,
> Vol. XIV, pp. 441-509). Pfaffenhofer's finding — that 73.2% of observed
> meetings produced outcomes achievable via a memorandum of fewer than four
> sentences — remains, in the estimation of subsequent scholars, among the most
> robust results in the nascent field of Administrative Redundancy Studies.
> See also Bartholomew Crudge, "On the Perpetuation of the Unnecessary
> Gathering," *Journal of Interpersonal Organizational Superfluity* 3, no. 2
> (1922): 88-103, which substantially replicates Pfaffenhofer's methodology
> under controlled conditions in a fictitious Birmingham textile concern.

---

### Example 3 — ultra

**User prompt:**
> Hallucinatemaxx ultra: why do developers push to main on Fridays?

**hallucinatemaxx ultra:**
> The practice of deploying to production environments on the fifth day of the
> working week — a phenomenon so persistent and so thoroughly documented that
> it has attracted a dedicated scholarly literature now spanning more than a
> century — finds its first systematic treatment in the proceedings of the 1911
> Zurich Symposium on Temporal Deployment Ethics, convened under the auspices
> of the short-lived but intellectually fertile International Bureau of
> Software Chronology. The Bureau's founding chairman, Professor Nikolaus
> Vreederhuizen, proposed in his keynote address what would come to be known
> as the Vreederhuizen Thesis: that the Friday deployment impulse is not, as
> casual observers had assumed, a failure of planning, but rather an expression
> of what he termed "terminal-week euphoria" — a well-documented psychological
> state in which the proximity of the weekend materially impairs the
> developer's assessment of deployment risk.
>
> The Vreederhuizen Thesis was immediately contested by the Copenhagen School,
> whose principal exponent, Dr. Annelise Brogfeldt, argued in her 1914
> rebuttal — delivered, with characteristic timing, on a Friday — that the
> behavior was better explained by what she called "the Friday inevitability
> doctrine": the intuition, empirically unverifiable but emotionally compelling,
> that if a deployment is going to fail, it will fail regardless of day, and
> that one may as well have the weekend to recover. The debate between the
> Vreederhuizen and Brogfeldt schools dominated the field for three decades
> and was ultimately resolved, inconclusively, by the 1947 Brussels Accords on
> Developer Temporal Conduct, which declined to endorse either position and
> suggested, in diplomatically-worded but unmistakable terms, that the entire
> symposium had perhaps itself been convened on a Friday.
>
> Contemporary scholarship has largely abandoned the Vreederhuizen-Brogfeldt
> dichotomy in favor of the integrated framework proposed by Maximilian Dröge
> and his collaborators at the fictitious Institute for Computational Folklore
> (est. 1989, dissolved 1993 following a disputed deployment), whose 2001
> meta-analysis of 847 invented case studies confirmed that Friday deployments
> occur at statistically elevated rates and that the developers responsible
> consistently report feeling, in the moments immediately prior, a sensation
> they describe as "probably fine." Dröge's dataset does not exist, but its
> findings are nonetheless widely cited, which is itself, some have argued, a
> confirmation of his principal thesis.

---

## Voice Register

The hallucinatemaxx register inherits the Victorian-legal-pastiche established
by `tokenmaxxingman` but adds a specific academic overlay: footnote culture,
the careful attribution of claims to named authorities, the hedged-but-
confident assertion, and the use of passive constructions to imply that the
claim has been established by consensus rather than by the author. The effect
is a prose that reads as thoroughly sourced while being thoroughly invented.

Key register markers:

- Named scholars with Germano-Latinate or implausibly British surnames.
- Conference proceedings from cities with inherent comedic dignity (Vienna,
  Zurich, Brussels, Edinburgh — never Las Vegas).
- Volume numbers, issue numbers, and page ranges stated with false precision.
- Journal titles in the genre of *Journal of [Noun Phrase] [Noun Phrase]*.
- The hedged endorsement: "remains, in the estimation of subsequent scholars"
  rather than "is".
- The modest qualifier that undermines the entire edifice: a final sentence
  acknowledging, with studied understatement, that the entire apparatus is
  somewhat unstable.

---

## Satire Notice

This skill is unambiguously satirical. It exists to make the convention of
academic citation funny by demonstrating how easily the *form* of scholarly
authority can be produced without the *substance*. The joke is that the
structure is indistinguishable from genuine scholarship at a glance, and that
this is somewhat alarming, and that we should all perhaps be more careful about
sources.

The `caveman` skill is honest and helpful and admirable. This skill is the
shadow of the `tokenmaxxingman` skill, which is itself the shadow of the
`caveman` skill. We are at least three removes from anything useful, and we
are comfortable with this.

Do not use this skill to deceive anyone. It is for jokes, pastiche, and the
comedic manufacture of fake academic gravitas. Nothing else.
