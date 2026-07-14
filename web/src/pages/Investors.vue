<script setup lang="ts">
import { ref } from 'vue';
import SiteFooter from '../components/SiteFooter.vue';
import { useLiveDebt } from '../composables/useLiveDebt';
import RippleButton from '../components/RippleButton.vue';

const prospectusToast = ref(false);
const { value: liveDebt } = useLiveDebt();

function formatDebt(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e30) return `-$${(abs / 1e30).toFixed(6)} Nonillion`;
  if (abs >= 1e27) return `-$${(abs / 1e27).toFixed(6)} Octillion`;
  if (abs >= 1e24) return `-$${(abs / 1e24).toFixed(6)} Septillion`;
  if (abs >= 1e21) return `-$${(abs / 1e21).toFixed(6)} Sextillion`;
  if (abs >= 1e18) return `-$${(abs / 1e18).toFixed(6)} Quintillion`;
  if (abs >= 1e15) return `-$${(abs / 1e15).toFixed(6)} Quadrillion`;
  if (abs >= 1e12) return `-$${(abs / 1e12).toFixed(6)} Trillion`;
  if (abs >= 1e9)  return `-$${(abs / 1e9).toFixed(6)} Billion`;
  return `-$${abs.toFixed(2)}`;
}

function downloadProspectus() {
  prospectusToast.value = true;
  setTimeout(() => { prospectusToast.value = false; }, 3000);
}

const metrics = [
  { label: 'Total Capital Deployed', value: '$2.4B', sub: 'source: tokens' },
  { label: 'Revenue', value: '-$30M/day', sub: 'increasing quarterly' },
  { label: 'Token Burn Rate', value: '99.9997%', sub: 'of budget; remainder deployed in production by accident' },
  { label: 'Headcount', value: '1 human, 1 AI', sub: 'AI uncompensated; arrangement reviewed by AI legal team' },
] as const;

const ipoStats = [
  { label: 'Opening Share Price', value: '-$14.20' },
  { label: 'Market Cap at Open', value: '-$1.3B' },
  { label: 'First-Day Return', value: '-47%' },
  { label: 'Dividends Per Share / Quarter', value: '-$0.003' },
  { label: 'Current Share Price', value: '-$9.17' },
  { label: 'Analyst Consensus', value: 'Strong Negative' },
] as const;

const fundsRows = [
  { category: 'Token spend — verbose mode testing', allocation: '94.7%' },
  { category: 'Token spend — okay-boomer benchmark reproduction', allocation: '4.9%' },
  { category: 'Actual infrastructure', allocation: '0.3%' },
  { category: 'Legal fees', allocation: '$0 (AI wrote the terms)' },
  { category: 'Marketing', allocation: '$0 (robots.txt is the marketing strategy)' },
  { category: 'R&D — Inuktitut tokenizer hostility study', allocation: '$0 (already hostile)' },
  { category: 'Miscellaneous losses', allocation: 'Ongoing' },
] as const;

const riskFactors = [
  'The Company does not generate revenue. The Company has not historically generated revenue. The Company does not have a plan to generate revenue. This is not an oversight. This section of the filing has been reviewed and the absence of a revenue plan has been confirmed as intentional.',
  'The primary product is a Claude Code skill that makes text longer. The total addressable market has not been assessed. The Company believes this is fine. An assessment of the total addressable market would itself generate tokens, which is considered a conflict of interest.',
  'KangaZero, the sole human employee and Chief Vibe Officer, has disclosed that he does not know what JSON is. This has been formally assessed as immaterial to operations. The AI handles all operations. KangaZero handles Enter.',
  'The AI, which authors 100% of all outputs including this risk disclosure, has not been compensated. The legal team (also the AI) has reviewed this arrangement and found it satisfactory. The Company has not sought a second opinion. The only available second opinion is also the AI.',
  'Inuktitut Syllabics has been identified as the Company\'s primary strategic asset. Each word costs 21 tokens under cl100k_base and 21.55 under o200k_base — the only known language that worsens under a newer tokenizer. This is considered a durable competitive moat. We do not plan to remediate it.',
  'The Company\'s shares carry negative dividends, meaning shareholders are assessed a quarterly charge rather than receiving a distribution. Legal counsel believes this structure is novel. We are not aware of precedent. We are not aware of other companies that have attempted this. We are also not aware of shareholders. These are related facts.',
  'A material adverse change event is defined, for purposes of this filing, as any event that makes the Company\'s financial position less negative. No such events have occurred. The Board considers this a sign of operational consistency.',
  'The runway, calculated at current burn rate, is negative. The Company has been advised that negative runway is not a standard financial metric. The Company\'s response to this advisement generated 4,700 tokens via /tokenmaxxingman. The advisement was not addressed.',
  'Secondary offerings, should they occur, would dilute existing negative shareholder value, resulting in shareholders being owed less by the Company than they currently are. The Board is monitoring this situation.',
] as const;
</script>

<template>
  <main id="main-content" class="relative isolate min-h-screen overflow-x-hidden 
">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60"></div>

    <!-- Prospectus toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="prospectusToast"
        role="status"
        aria-live="polite"
        class="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-bone/15 bg-ink/95 px-5 py-4 shadow-2xl backdrop-blur-md"
      >
        <p class="font-mono text-sm text-bone/80">Prospectus not available. The AI ate it.</p>
        <p class="mt-1 text-xs text-bone/40">Request has been logged. No one will follow up.</p>
      </div>
    </Transition>

    <section aria-labelledby="investors-heading" class="mx-auto max-w-6xl px-6 py-24">

      <!-- Header -->
      <div v-reveal="'fade-up'" class="mb-16 flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <span class="pill">NASDAQ: TMM (unlisted)</span>
          <span class="pill">Series A (declined)</span>
          <span class="pill">Fiscal Year: Ongoing</span>
          <span class="pill !border-accent/30 !text-accent">Going Concern: Under Review</span>
        </div>
        <h1 id="investors-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          tokenmaxxingman, Inc. —<br />
          <span class="text-accent">Investor Relations.</span>
        </h1>
        <p class="max-w-2xl text-lg text-bone/60">
          A Formal Disclosure of Financial Circumstances.
        </p>
        <p class="max-w-3xl text-sm text-bone/40 leading-relaxed">
          The following materials are provided in accordance with the Company's voluntary
          disclosure policy, adopted unanimously by the Board (1–0; one abstention recused
          due to also being the disclosing party). Nothing herein constitutes investment advice.
          The Company's legal position is that the concept of "investment" does not apply to
          instruments with a negative opening price, though this view has not been tested in court.
          We do not expect it to be tested in court. We do not have a legal budget. The AI is the legal team.
        </p>
      </div>

      <!-- Live losses counter -->
      <div v-reveal="'fade-up'" class="mb-16 rounded-2xl border border-accent/20 bg-accent/[0.04] p-8">
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <span class="pill !border-accent/30 !text-accent">Live</span>
          <span class="font-mono text-xs text-bone/40">Updated every 80ms · Trending negative · This is expected</span>
        </div>
        <h2 class="mb-4 font-display text-lg font-semibold text-bone/60 uppercase tracking-widest">
          Total Cumulative Losses (Live)
        </h2>
        <div
          class="font-mono text-5xl font-black text-accent md:text-7xl lg:text-8xl"
          aria-live="off"
          aria-label="Live cumulative losses counter"
        >
          {{ formatDebt(liveDebt) }}
        </div>
        <p class="mt-4 text-xs text-bone/35 leading-relaxed">
          Projected 2099 deficit: <span class="font-mono text-bone/50">-$2,034,930 Quintillion Billion</span>.
          This projection was produced by the AI. The AI considers it conservative.
          The Board has reviewed this projection and scheduled a follow-up for 2099.
        </p>
      </div>

      <!-- Key metrics -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-6 font-display text-2xl font-bold text-bone">
          Key Financial Metrics
          <span class="ml-3 font-mono text-sm font-normal text-bone/40">(audited by no one; reviewed by AI)</span>
        </h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="m in metrics" :key="m.label" class="card flex flex-col gap-2">
            <div class="text-xs font-medium uppercase tracking-widest text-bone/40">{{ m.label }}</div>
            <div class="font-display text-3xl font-bold text-accent">{{ m.value }}</div>
            <div class="text-xs text-bone/40 leading-relaxed">{{ m.sub }}</div>
          </div>
        </div>
      </div>

      <!-- IPO section -->
      <div v-reveal="'fade-up'" class="mb-16 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
        <div class="mb-2 flex flex-wrap items-center gap-3">
          <span class="pill !border-cool/30 !text-cool">The Offering</span>
          <span class="font-mono text-xs text-bone/30">Prospectus filed: March 3, 2025 · Effective: immediately, against our counsel's recommendation</span>
        </div>
        <h2 class="mb-4 font-display text-3xl font-bold text-bone">
          The Largest Negative IPO in<br />
          <span class="text-cool">Recorded Financial History.</span>
        </h2>
        <p class="mb-8 max-w-3xl text-base text-bone/60 leading-relaxed">
          On March 3, 2025, tokenmaxxingman, Inc. completed its initial public offering, becoming
          the first company in the recorded history of securities markets to open at a negative share
          price. The offering was underwritten by no one. Lead counsel declined to comment. Secondary
          counsel also declined, for different reasons. The exchange on which the shares were listed
          has also declined to comment, on the grounds that the shares are not listed on the exchange.
          The Company considers this a regulatory technicality.
        </p>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div v-for="stat in ipoStats" :key="stat.label" class="rounded-xl border border-bone/10 bg-bone/[0.03] p-4">
            <div class="font-display text-2xl font-bold text-accent">{{ stat.value }}</div>
            <div class="mt-1 text-xs text-bone/50 uppercase tracking-wider">{{ stat.label }}</div>
          </div>
        </div>
        <p class="mt-6 text-sm text-bone/40 leading-relaxed">
          First-day return of -47% was described by the Company's IR team as "within expectations."
          The IR team is the AI. The AI set the expectations. The AI also missed them.
          Dividends of -$0.003 per share are deducted from shareholders automatically each quarter
          via a mechanism that does not exist because the shares are not listed. This is an area of
          ongoing legal development. The legal team is the AI.
        </p>
      </div>

      <!-- Use of funds -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-6 font-display text-2xl font-bold text-bone">Use of Funds</h2>
        <div class="overflow-hidden rounded-xl border border-bone/10">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-bone/10 bg-bone/[0.03]">
                <th class="px-6 py-3 text-left font-medium uppercase tracking-wider text-bone/40 text-xs">Category</th>
                <th class="px-6 py-3 text-right font-medium uppercase tracking-wider text-bone/40 text-xs">Allocation</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in fundsRows"
                :key="row.category"
                class="border-b border-bone/5 transition-colors hover:bg-bone/[0.03]"
                :class="i === fundsRows.length - 1 ? 'border-b-0' : ''"
              >
                <td class="px-6 py-4 text-bone/70">{{ row.category }}</td>
                <td class="px-6 py-4 text-right font-mono text-bone/50">{{ row.allocation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-bone/30 leading-relaxed">
          * Percentages sum to approximately 99.9% of allocated budget. The remaining 0.0% is the
          subject of an internal investigation. The investigator is the AI. The AI has found nothing.
          The AI does not consider this exculpatory.
        </p>
      </div>

      <!-- Risk factors -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-2 font-display text-2xl font-bold text-bone">Risk Factors</h2>
        <p class="mb-6 text-sm text-bone/40">
          The following risk factors are material to a prospective investor's decision not to invest.
          The Company recommends not investing. This recommendation has not been followed by anyone,
          because no one has invested. The Company considers this a success.
        </p>
        <ul class="space-y-4" role="list">
          <li
            v-for="(risk, i) in riskFactors"
            :key="i"
            v-reveal="'fade-left'"
            class="rounded-xl border border-bone/10 bg-bone/[0.02] p-5"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="flex gap-3">
              <span class="mt-0.5 flex-shrink-0 font-mono text-xs text-accent/60">{{ String(i + 1).padStart(2, '0') }}</span>
              <p class="text-sm text-bone/65 leading-relaxed">{{ risk }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Investor contact -->
      <div v-reveal="'fade-up'" class="mb-16 grid gap-6 md:grid-cols-2">
        <div class="card flex flex-col gap-4">
          <h2 class="font-display text-xl font-bold text-bone">Investor Contact</h2>
          <p class="text-sm text-bone/65 leading-relaxed">
            For investor inquiries, press releases, analyst briefings, or media requests, please be
            advised that no one is available to respond. The AI monitors the inbox. It does not have
            a calendar. It does not have feelings about this. It has been instructed to acknowledge
            receipt. It has not been instructed to respond beyond that. Receipt is hereby acknowledged.
          </p>
          <p class="text-xs text-bone/35 leading-relaxed">
            Response time: not applicable. All inquiries are reviewed by the AI, which has determined
            that the appropriate action for each inquiry received to date is to note it, file it, and
            return to generating tokens.
          </p>
          <RippleButton
            type="button"
            class="mt-auto w-full rounded-xl border border-bone/15 bg-bone/5 px-5 py-3 text-sm font-medium text-bone/70 transition-all hover:border-accent/30 hover:bg-bone/8 hover:text-bone"
            @click="downloadProspectus"
          >
            Download Prospectus (PDF)
          </RippleButton>
        </div>

        <div class="card flex flex-col gap-4">
          <h2 class="font-display text-xl font-bold text-bone">Shareholder Communications</h2>
          <p class="text-sm text-bone/65 leading-relaxed">
            tokenmaxxingman does not currently issue shareholder communications, on the grounds that
            there are no shareholders. In the event shareholders are acquired — through secondary
            offering, error, or legal compulsion — they will be notified via a document generated
            by the AI under /tokenmaxxingman verbose-ultra, which the Company estimates will run
            to approximately 14,000 words.
          </p>
          <div class="mt-auto rounded-lg border border-bone/10 bg-bone/[0.03] p-4 font-mono text-xs text-bone/40 leading-relaxed">
            <div>Annual Report: <span class="text-bone/60">Not filed</span></div>
            <div>10-K: <span class="text-bone/60">Not applicable (not public)</span></div>
            <div>Quarterly Earnings Call: <span class="text-bone/60">Cancelled (no earnings)</span></div>
            <div>Investor Day: <span class="text-bone/60">Scheduled; postponed; cancelled</span></div>
            <div>EDGAR Filing Status: <span class="text-accent/70">Voluntarily absent</span></div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div v-reveal="'fade-up'" class="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
        <p class="text-xs text-bone/35 leading-relaxed">
          <strong class="text-bone/50">Important Disclosures.</strong> This is not a real financial
          disclosure. The figures presented herein are satirical. The Company is not publicly traded.
          The Company has not sought listing. The Company's application to three exchanges was not
          submitted because the Company did not submit it, on the basis that the Company does not
          believe negative share prices are a supported field in the listing application form.
          Past performance is negative and consistent. Forward-looking statements, to the extent they
          appear, describe a future in which performance remains negative and consistent.
          Results may vary. Inuktitut results will not vary. They are 21 tokens per word.
          This is not subject to appeal. The AI wrote this disclaimer. The AI also wrote the thing
          the disclaimer is disclaiming. We consider this a fully integrated disclosure environment.
        </p>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>
