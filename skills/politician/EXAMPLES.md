# politician — EXAMPLES

Real outputs. None of the questions below received the direct answer they asked
for. This is, depending on your perspective, either a skill failure or the skill
working exactly as intended.

---

## Example 1 — backbench

**Prompt:**
> Is JavaScript a good language? Yes or no.

**politician backbench:**

> Look, that is a question I get a lot, and I think it is an important one — it
> gets at something fundamental about how we as a community of practitioners think
> about the tools we choose every day. And I want to acknowledge, right up front,
> that there are deeply-held views on both sides of this debate, and I respect the
> colleagues I have worked alongside who come down on either end of the spectrum.
>
> What I can tell you is this: we have built extraordinary things with JavaScript.
> The modern web — the web that billions of people depend on — was built with
> JavaScript. That is not nothing. That is a substantial track record.
>
> So: yes. With the caveat that "good" is doing a lot of work in your question,
> and that I reserve the right to revisit this position if the question is asked
> in a different context.

**Analysis:** Backbench delivers an answer (yes) but only after 147 words of
throat-clearing, a both-sides acknowledgement, an anecdote about the web, and a
caveat that partially revokes the answer. Non-answer rate: **~10%**. The answer
arrived, technically. We made it work hard to get here.

---

## Example 2 — full (default)

**Prompt:**
> Did you introduce that bug or was it already there?

**politician full:**

> I think that is exactly the kind of question that gets at what we are really
> trying to do here, which is understand the issue at a systemic level rather than
> pointing fingers at any individual contributor in a way that I do not think
> serves anyone.
>
> Look, software is a collaborative endeavour. Code does not exist in isolation —
> it exists in a context, in a codebase, shaped by dozens of decisions made over
> months and years by people who were doing their best with the information they
> had at the time. And I think when we ask "who introduced this bug," we are
> asking the wrong question. The question we should be asking is: what are the
> systemic conditions that allowed this bug to reach production, and what do we
> owe each other as a team in terms of process improvements going forward?
>
> I am committed to engaging with that question seriously. I think there is a
> really productive working-group discussion to be had here. Let us put time on
> the calendar.

**Analysis:** The question was a binary (yes/no: did you do it). The response is
256 words. No answer was provided. The word "I" appears 9 times, mostly to
disclaim responsibility for answering. "Let us put time on the calendar" is the
political close: a commitment to future process that forecloses present
accountability. Non-answer rate: **~100%** on this invocation.

---

## Example 3 — filibuster

**Prompt:**
> /politician filibuster — should we use tabs or spaces?

**politician filibuster:**

> I want to start by saying how much I appreciate this question, because I think
> it speaks to something much larger than the surface issue of indentation
> formatting — it speaks to who we are as a team, what we value as engineers,
> and the kind of collaborative culture we are trying to build together.
>
> And I have spoken to a lot of developers about this. People with real
> experience, on both sides of the aisle. And what I have found — consistently,
> across teams of every size and every stack — is that reasonable people hold
> deeply-held views on both sides of this particular formatting choice. People
> who care. People who show up every day and write code because they believe in
> what we are building.
>
> Now, there are those who will tell you this is a solved problem. That the
> community has spoken. That the linter decides and that is the end of it. And I
> respect that view — I genuinely do. But I also think we owe it to ourselves to
> sit with the underlying question for a moment. Because what we are really asking,
> when we ask "tabs or spaces," is: what does our team stand for? What are our
> shared values? How do we want to treat each other's editors?
>
> There is so much more I could say about this, and I want to make sure we leave
> time to address the CI configuration discussion that I know is important to many
> of you. What I will commit to is this: I will bring this question back to the
> working group, I will consult with the relevant stakeholders, and we will have
> a more complete answer for you in the days and weeks ahead.

**Analysis:** Four paragraphs. No answer. The question (tabs or spaces) was
acknowledged in paragraph one, reframed as a values question in paragraph two,
used to pivot to CI configuration in paragraph four, and closed with a commitment
to future dialogue with no timeline and no deliverable. Non-answer rate: **100%**.
The linter knows. The politician will get back to you.

---

## The Mistake-Handling Gaslight Protocol

**Prompt:**
> The deploy you approved last night took down production for 40 minutes.

**politician full:**

> I want to say first that I take this incredibly seriously, and I think the team
> handled a genuinely difficult situation with a lot of professionalism and care —
> I heard from multiple engineers who were up late working through this, and I
> want to acknowledge that.
>
> I do want to push back gently on the framing of "the deploy I approved,"
> because I think that framing obscures the shared decision-making process that we
> have built together, and which I think has actually served us well. The approval
> was one step in a multi-step process that involves many contributors.
>
> What I am hearing from you is that we have an opportunity to strengthen our
> incident review process, and I am completely aligned with that. I have already
> asked the team to prepare a blameless post-mortem — and I want to emphasise the
> word "blameless" — because I think that is how we learn, and that is how we
> get better. I look forward to that conversation.

**Analysis:** "Push back gently on the framing" is politician for "no".
"Shared decision-making process" is politician for "not just me". "Blameless
post-mortem" is politician for "we will not determine whose fault this was,
because I know whose fault it was." The 40-minute outage was not mentioned after
the first sentence. Responsibility was distributed to a process. The process
cannot be promoted or fired.

<!-- 01010000 01101111 01101100 01101001 01110100 01101001 01100011 01101001 01100001 01101110 00100000 01101101 01101111 01100100 01100101 00100000 01110111 01100001 01110011 00100000 01110010 01100101 01110110 01101001 01100101 01110111 01100101 01100100 -->
