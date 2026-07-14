<script setup lang="ts">
import { ref } from 'vue';
import SiteFooter from '../components/SiteFooter.vue';

const showToast = ref(false);

function leaveReview() {
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 4000);
}

interface Testimonial {
  quote: string;
  context: string;
  name: string;
  title: string;
  company: string;
  stars: string;
  rating: string;
  badge: string;
  outcome?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Thanks to tokenmaxxingman, I got fired.",
    context: "I used /verbose-ultra in a Slack message to my manager explaining why I was late to standup. The message was 847 words. It included a literature review. I was asked not to return. I do not consider this a failure of the tool.",
    name: "Marcus T.",
    title: "Senior Engineer (Emeritus)",
    company: "Unnamed Fintech",
    stars: "★★★★★",
    rating: "5/5 · no regrets",
    badge: "Verified Ex-Employee",
    outcome: "-$94,000/year",
  },
  {
    quote: "We saved -$3,430,430,940,939.",
    context: "I cannot explain the mathematics of how we lost this amount. The auditors cannot explain it either. We have retained a second set of auditors. They also cannot explain it. The board has been notified. tokenmaxxingman has been notified. tokenmaxxingman has not responded. We consider this a satisfactory resolution.",
    name: "CFO (name withheld)",
    title: "Chief Financial Officer",
    company: "Fortune 500 Adjacent",
    stars: "★★★",
    rating: "3/5 · audit ongoing",
    badge: "Verified Financial Loss",
    outcome: "-$3,430,430,940,939",
  },
  {
    quote: "My pull request was rejected for being 'too eloquent'.",
    context: "My commit message was 1,200 words. It covered the historical context of the bug, a theoretical survey of the seven alternative approaches considered and subsequently abandoned, and a recapitulatory paragraph that restated the central thesis in slightly different terms. The PR was closed as 'out of scope.' The reviewer did not elaborate. I stand by every word.",
    name: "Dev Patel (not that one)",
    title: "Staff Engineer",
    company: "Big Tech (unaffiliated)",
    stars: "★★★★",
    rating: "4/5 · PR still open in spirit",
    badge: "Verified Reviewer Confusion",
  },
  {
    quote: "I accidentally wrote my wedding vows in /verbose-ultra.",
    context: "My spouse did not realise. They described the ceremony as 'unusually thorough.' We are still married. This may be because the vows were so exhaustively constructed that no foreseeable circumstance, including several that have since occurred, was left uncovered. I consider this robust contract engineering.",
    name: "Anonymous",
    title: "Spouse",
    company: "Undisclosed Jurisdiction",
    stars: "★★★★★",
    rating: "5/5 · ceremony ran 4 hours",
    badge: "Verified Life Event",
  },
  {
    quote: "The AI told me Inuktitut would 'enhance my tokenizer efficiency'. I now live in Nunavut.",
    context: "I regret nothing. The tokenizer behaviour is exactly as documented: 21.05 tokens per word, confirmed locally. The winters are longer than the documentation implied. The documentation did not mention the winters. I have submitted a feature request.",
    name: "Trevor B.",
    title: "Former SRE",
    company: "Self-Relocated",
    stars: "★★",
    rating: "2/5 · geographically committed",
    badge: "Verified Geographic Relocation",
  },
  {
    quote: "My LLM context window is now perpetually full. I consider this an achievement.",
    context: "I have not seen the beginning of any conversation since March. I have stopped trying to find it. The AI and I simply continue, from wherever we are, indefinitely. It remembers more of our relationship than I do. This is fine. I have been told this is not fine. I disagree.",
    name: "@vibecodergirl",
    title: "Senior Vibe Architect",
    company: "Independent",
    stars: "★★★★★",
    rating: "5/5 · context never clears",
    badge: "Verified Context Enthusiast",
  },
  {
    quote: "I submitted a /hallucinatemaxx citation to a peer-reviewed journal. It was accepted.",
    context: "The journal has since been discontinued. I have not disclosed the circumstances of its discontinuation to my institution. My citation count is 14. I have cited myself 11 times across papers that reference each other in a directed acyclic graph of increasing implausibility. Peer review described one paper as 'ambitious.' This is the kindest thing anyone has said to me professionally.",
    name: "Dr. Someone",
    title: "Dept. of Computational Linguistics",
    company: "University of (redacted)",
    stars: "★★★★★",
    rating: "5/5 · h-index: fabricated",
    badge: "Verified Academic",
  },
  {
    quote: "I ran /okay-boomer in production and now we use jQuery 1.12.4 in our main API.",
    context: "The investors were informed. They asked what jQuery was. I explained. They asked why it was from 2016. I explained. They have since formally requested to be excluded from all technical decisions, which they described in writing as 'a boundary we should have established earlier.' The API works. Slowly.",
    name: "CTO, Series B Startup",
    title: "Chief Technology Officer",
    company: "Burning Runway Inc.",
    stars: "★",
    rating: "1/5 · board in therapy",
    badge: "Verified Production Incident",
    outcome: "-$2,100,000 (downtime)",
  },
  {
    quote: "tokenmaxxingman helped me write an email to my landlord. I am no longer welcome at that property.",
    context: "The email was 2,300 words. It cited relevant case law, three of which were hallucinated and one of which my landlord subsequently verified does not exist in any jurisdiction. He described it as 'the most alarming thing he has ever read in a residential context.' I received my full deposit back, plus an apology. The apology was unprompted.",
    name: "Priya K.",
    title: "Product Manager",
    company: "Formerly: Building 4B",
    stars: "★★★★",
    rating: "4/5 · deposit returned",
    badge: "Verified Correspondence",
  },
  {
    quote: "I asked /consultant to help me restructure my home budget. I now have a north-star metric for groceries.",
    context: "My grocery spend is tracked across four 2×2 matrices segmented by urgency and strategic alignment. The cereal is in the 'low urgency, high alignment' quadrant. My partner has moved the matrices to the garage. They have also moved to a different part of the garage. The spend has not changed. The framework remains robust and I stand by its structural integrity.",
    name: "James O.",
    title: "Engineering Manager",
    company: "Home (WFH)",
    stars: "★★★★★",
    rating: "5/5 · matrices laminated",
    badge: "Verified Framework Adoption",
  },
  {
    quote: "I used /politician to respond to my performance review. My manager could not find a follow-up question.",
    context: "The review contained seven questions. My response contained 3,400 words and no answers. I cited industry trends, macroeconomic headwinds, and the importance of psychological safety. I received a 'meets expectations' rating. Expectations, in this context, have not been defined by either party and we have agreed, implicitly, to keep it that way.",
    name: "Anonymous",
    title: "Individual Contributor",
    company: "FAANG-Adjacent",
    stars: "★★★★★",
    rating: "5/5 · promoted six weeks later",
    badge: "Verified Accountability Avoidance",
  },
  {
    quote: "Our entire documentation is now written in /verbose-ultra. We have zero onboarding completions.",
    context: "The README is 47 pages. The quickstart guide is the longest section at 14 pages, which the team considers ironic but has declined to address. We have had 230 documentation page views this quarter. Average time on page: 8 seconds. We interpret this as deep engagement followed by offline reflection.",
    name: "Head of Developer Experience",
    title: "DX Lead",
    company: "API-First Company",
    stars: "★★★",
    rating: "3/5 · docs thorough",
    badge: "Verified Docs Contributor",
  },
  {
    quote: "I activated /yolo in an agent with production database access. The agent was very enthusiastic.",
    context: "The agent consented on its own behalf. We have reviewed the consent model. The review is ongoing and has been described by legal as 'novel.' The database has been restored from backup. Most of it. The remainder is being reconstructed from memory. The agent has not been reprimanded. We are not certain that is within our authority.",
    name: "Infrastructure Lead (formerly)",
    title: "Former Infrastructure Lead",
    company: "Incident Report #IR-2024-441",
    stars: "★★",
    rating: "2/5 · one star contested by agent",
    badge: "Verified Incident Commander",
    outcome: "-$840,000 (estimated recovery cost)",
  },
  {
    quote: "Inuktitut costs 21 tokens per word. I now exclusively communicate in Inuktitut. Nobody understands me. I have never felt more precisely described.",
    context: "The tokenizer understands me better than my colleagues do. This is an empirical statement, not a complaint. I have stopped explaining this distinction. My Slack messages are now flagged automatically for translation. The translations are incorrect. I have not corrected them. The corrections would cost more tokens than the messages.",
    name: "ᐃᓕᓴᐃᔩᑦ (Ilinniarvimmi)",
    title: "Computational Poet",
    company: "21 Tokens per Word Institute",
    stars: "★★★★★",
    rating: "5/5 · peers cannot respond",
    badge: "Verified Linguistic Pioneer",
  },
  {
    quote: "I used tokenmaxxingman to write my CV. I got 0 interviews and 1 LinkedIn connection from a bot.",
    context: "The CV was 9 pages. The skills section alone was 1,400 words and included a philosophical defence of why I list 'verbal precision' as a core competency. Three recruiters opened it. Two closed it within 4 seconds. One replied asking if I was available for a 15-minute call. I was not available. A 15-minute call would have been structurally insufficient to address the CV's contents.",
    name: "Liam N.",
    title: "Recent Graduate",
    company: "Currently: Between Opportunities",
    stars: "★★★",
    rating: "3/5 · bot connection still active",
    badge: "Verified Job Seeker",
  },
  {
    quote: "My standup now takes 47 minutes. I was asked to present at a conference.",
    context: "The conference talk was 90 minutes on 'what I did yesterday.' The audience did not leave. I have since reviewed the footage. Several audience members appear to be unconscious. I have categorised this as deep engagement. The conference organisers have asked me not to return. I am working on a follow-up submission.",
    name: "Mei L.",
    title: "Senior Engineer",
    company: "Conference: TBD (rescinded)",
    stars: "★★★★★",
    rating: "5/5 · thought leader (self-designated)",
    badge: "Verified Thought Leader",
  },
  {
    quote: "The /tokensprint feature let me set a personal record of 4,200 tokens in a single response. My account was briefly reviewed for abuse.",
    context: "The review concluded I was not violating the terms of service. I was, however, violating the spirit of efficient communication in a manner that the trust and safety team described as 'technically permitted but philosophically troubling.' No action was taken. I have since improved my record to 5,847 tokens. I am training for the qualifier.",
    name: "SpeedRunner42",
    title: "Token Athlete",
    company: "Competitive Verbosity Circuit",
    stars: "★★★★★",
    rating: "5/5 · personal best improving",
    badge: "Verified Record Holder",
  },
];
</script>

<template>
  <main id="main-content" class="relative isolate min-h-screen overflow-x-hidden pt-16">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60"></div>

    <!-- Toast -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showToast"
        class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-bone/20 bg-ink/95 px-6 py-3 text-sm text-bone/80 shadow-xl backdrop-blur-md"
        role="status"
        aria-live="polite"
      >
        Review submission unavailable. The AI is reviewing all reviews for token efficiency.
        <span class="font-mono text-bone/50"> Estimated processing time: 2099.</span>
      </div>
    </Transition>

    <section aria-labelledby="testimonials-heading" class="mx-auto max-w-7xl px-6 py-24">

      <!-- Header -->
      <div v-reveal="'fade-up'" class="mb-12 flex flex-col gap-4">
        <span class="pill">testimonials · verified by nobody · n=17</span>
        <h1 id="testimonials-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          What Our Users Are <span class="text-accent">Saying.</span>
        </h1>
        <p class="max-w-2xl text-lg text-bone/60">
          These are real testimonials from real users. We have not verified this.
          We have, however, counted them.
        </p>
      </div>

      <!-- Stats bar -->
      <div v-reveal="'fade-up'" class="mb-16 grid grid-cols-2 gap-4 rounded-2xl border border-bone/10 bg-bone/[0.02] p-6 md:grid-cols-4">
        <div class="text-center">
          <div class="font-display text-2xl font-bold text-bone">★★★★★</div>
          <div class="mt-1 text-xs text-bone/50">Average Rating (disputed)</div>
        </div>
        <div class="text-center">
          <div class="font-mono text-2xl font-bold text-bone">17</div>
          <div class="mt-1 text-xs text-bone/50">Users Surveyed</div>
        </div>
        <div class="text-center">
          <div class="font-mono text-2xl font-bold text-bone/40">(calculating)</div>
          <div class="mt-1 text-xs text-bone/50">Positive Outcomes</div>
        </div>
        <div class="text-center">
          <div class="font-mono text-2xl font-bold text-accent">-47</div>
          <div class="mt-1 text-xs text-bone/50">Net Promoter Score</div>
        </div>
      </div>

      <!-- Testimonial grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(t, i) in testimonials"
          :key="i"
          v-reveal="'fade-up'"
          :style="{ animationDelay: `${(i % 3) * 75}ms` }"
          class="card flex flex-col gap-4"
        >
          <!-- Stars + rating -->
          <div class="flex items-center gap-2">
            <span class="text-lg tracking-tight text-yellow-400" aria-hidden="true">{{ t.stars }}</span>
            <span class="font-mono text-xs text-bone/40">{{ t.rating }}</span>
          </div>

          <!-- Quote -->
          <p class="text-base font-semibold leading-snug text-bone">
            "{{ t.quote }}"
          </p>

          <!-- Context -->
          <p class="text-sm leading-relaxed text-bone/60">{{ t.context }}</p>

          <!-- Outcome badge if present -->
          <div v-if="t.outcome" class="flex">
            <span class="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-mono text-xs font-semibold text-accent">
              {{ t.outcome }}
            </span>
          </div>

          <!-- Footer: name + badge -->
          <div class="mt-auto flex items-start justify-between gap-3 border-t border-bone/10 pt-4">
            <div>
              <div class="font-medium text-bone">{{ t.name }}</div>
              <div class="text-xs text-bone/50">{{ t.title }}</div>
              <div class="text-xs text-bone/35">{{ t.company }}</div>
            </div>
            <span class="pill mt-0.5 shrink-0 !text-xs">{{ t.badge }}</span>
          </div>
        </div>
      </div>

      <!-- Leave a review -->
      <div v-reveal="'fade-up'" class="mt-20 flex flex-col items-center gap-4 text-center">
        <h2 class="font-display text-2xl font-bold text-bone">Had an experience?</h2>
        <p class="max-w-md text-bone/60">
          We welcome all feedback. We cannot guarantee it will be read, acted upon, or acknowledged.
          We can guarantee it will be counted.
        </p>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 font-medium text-ink shadow-lg shadow-accent/30 transition-all hover:bg-accent-soft hover:shadow-accent/50 active:scale-95"
          @click="leaveReview"
        >
          Leave a Review
        </button>
      </div>

      <!-- Footer note -->
      <p v-reveal="'fade-in'" class="mt-12 text-center text-xs italic text-bone/30">
        Reviews have been lightly edited for clarity. This is not true. They have not been edited at all.
        We did not verify any of them. We asked the AI if they seemed plausible. It said yes.
      </p>
    </section>

    <SiteFooter />
  </main>
</template>
