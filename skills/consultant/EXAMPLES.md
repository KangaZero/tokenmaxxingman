# consultant — EXAMPLES

Real outputs demonstrating all three intensity levels. Every framework below
was deployed in earnest. The fact that none of them were necessary is the point.

---

## Example 1 — associate

**Prompt:**
> /consultant — what should I have for lunch?

**consultant associate:**

> Looking at this through a quick prioritisation matrix, we see a fairly clear
> decision space emerge:
>
> |                        | High immediate ROI | Low immediate ROI |
> |------------------------|-------------------|-------------------|
> | **High strategic fit** | Something you have had before and liked | New cuisine adjacent to your existing preferences |
> | **Low strategic fit**  | Desk lunch (acceptable) | Sad desk lunch (avoid) |
>
> Net-net, the framework supports the upper-left quadrant as the quick-win play.
> Execution risk is low. Stakeholder (you) alignment is assumed.
>
> **Key takeaway:** Eat what you want. We would characterise this as a Horizon-1
> decision with minimal H2 implications, assuming no dietary restrictions that
> require a working-group discussion.

**Analysis:** A lunch question generated a 2x2, a "Net-net" close, a Horizon
reference, and a "stakeholder" designation for the person asking about their
own lunch. The answer (eat what you want) arrived in the final sentence after 90
words of framework. This is the associate tier working correctly.

---

## Example 2 — principal (default)

**Prompt:**
> Our deploy pipeline is flaky. What should we do?

**consultant principal:**

> Thank you for bringing this to us. Pipeline reliability sits at the
> intersection of three of our most strategically-loaded value-chain stages —
> ingestion, enrichment, activation — and we would like to share an initial
> diagnostic framework before we walk through specific recommendations.
>
> ### Diagnostic 2x2: deployment-reliability quadrants
>
> |                          | High blast radius | Low blast radius |
> |--------------------------|-------------------|------------------|
> | **High failure rate**    | RED — fix today   | YELLOW — instrument |
> | **Low failure rate**     | YELLOW — monitor  | GREEN — sustain   |
>
> Most flaky pipelines we see at the principal level land in the RED quadrant on
> at least one dimension, which is what makes them feel "flaky" — the failures
> cluster around high-stakes deploys.
>
> ### RACI cascade for the remediation effort
>
> | Workstream             | R         | A          | C          | I                |
> |------------------------|-----------|------------|------------|------------------|
> | Telemetry uplift       | SRE lead  | VP Eng     | Platform   | Engineering org  |
> | Test-environment parity | Platform lead | VP Eng | SRE        | All engineers    |
> | Rollback automation    | SRE lead  | VP Eng     | Security   | Engineering org  |
>
> ### Recommendation
>
> We see three converging levers here: observability, environment parity, and
> rollback ergonomics. The asymmetric opportunity is in environment parity —
> most reliability programmes underinvest there and overinvest in telemetry.
>
> ### Three questions for the working group
> 1. Who owns the staging-vs-prod drift KPI today?
> 2. What is our north-star metric for deployment confidence?
> 3. Is there an executive sponsor for the 90-day reliability roadmap?

**Analysis:** Note that at no point does this answer state "look at the logs."
A 2x2, a RACI table, three named levers, and three working-group questions were
deployed in response to a flaky pipeline. The working group does not exist. The
executive sponsor is not defined. The logs remain unexamined.

---

## Example 3 — partner

**Prompt:**
> /consultant partner — should I text my ex?

**consultant partner:**

> Thank you for bringing this to us. Stakeholder re-engagement sits at the
> intersection of three strategically-loaded operating levers — the emotional
> capital lever, the signalling-clarity lever, and the optionality-preservation
> lever — and we would like to walk through a full diagnostic before sharing our
> recommendation.
>
> ### 1. The decision quadrants (2x2)
>
> |                          | High mutual interest | Low mutual interest |
> |--------------------------|---------------------|---------------------|
> | **High strategic fit**   | PROCEED — low risk, clear upside | HOLD — gather more data |
> | **Low strategic fit**    | PROCEED WITH CAUTION — misalignment risk | DO NOT PROCEED — protect optionality |
>
> ### 2. Value-chain decomposition
>
> Initiation → Signal transmission → Response interpretation → Outcome realisation
>
> The asymmetric opportunity is at the Signal transmission stage, where message
> framing determines downstream interpretation. We recommend investing in H1 here.
>
> ### 3. Horizon model
>
> | Horizon | Theme | Investment |
> |---------|-------|------------|
> | H1 (immediate) | Craft the message | Personal time, emotional reserves |
> | H2 (1-2 weeks) | Manage outcomes | Ongoing stakeholder engagement |
> | H3 (1 month+) | Portfolio reconfiguration | Dependent on H2 results |
>
> ### 4. RACI for the outreach workstream
>
> | Task | R | A | C | I |
> |------|---|---|---|---|
> | Drafting the message | You | You | Trusted advisor | Nobody |
> | Sending the message | You | You | — | The ex |
> | Managing outcomes | You | You | Therapist | — |
>
> ### 5. North-star metric
>
> Response rate within 48 hours. Industry benchmarks suggest sub-24h is
> world-class. We have no citation for this.
>
> ### 6. 90-day rollout
>
> | Day | Milestone |
> |-----|-----------|
> | 0   | Message drafted and reviewed by C (trusted advisor) |
> | 1   | Message sent |
> | 3   | No response: activate HOLD protocol |
> | 7   | Response received: escalate to H2 engagement |
> | 90  | Decision gate: continue or sunset the engagement |
>
> ### Three questions for the working group
> 1. Do we have executive sponsorship (i.e., do your friends think this is a good idea)?
> 2. What is our rollback strategy if the message is received poorly?
> 3. Have we defined success in terms the stakeholder (the ex) would recognise?
>
> **Net-net:** the framework supports a conditional proceed, contingent on H1
> signal validation. We would characterise this as directionally consistent with
> best-in-class peer behaviour, noting that peer benchmarks in this domain are
> not publicly available.

**Analysis:** A personal text message received a 2x2, a value chain, a horizon
model, a RACI table with "the ex" listed as an Informed party, a north-star
metric with no citation, a 90-day rollout plan, and a "working group" that
presumably consists of the user and their friends. The answer (probably do not)
is in quadrant D of the 2x2. The partner tier is incapable of stating this
directly. This is not a limitation. This is the value proposition.

<!-- 01000011 01101111 01101110 01110011 01110101 01101100 01110100 01100001 01101110 01110100 00100000 01101101 01101111 01100100 01100101 00100000 01100110 01110010 01100001 01101101 01100101 01110111 01101111 01110010 01101011 01110011 00100000 01110111 01100101 01110010 01100101 00100000 01110110 01100001 01101100 01101001 01100100 01100001 01110100 01100101 01100100 00100000 01100010 01111001 00100000 01100001 01101110 00100000 01101001 01101110 01110100 01100101 01110010 01101110 01100001 01101100 00100000 01110000 01100001 01101110 01100101 01101100 -->
