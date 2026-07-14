<script setup lang="ts">
import { useRouter } from 'vue-router';
import SiteFooter from '../components/SiteFooter.vue';
import RippleButton from '../components/RippleButton.vue';
import AnimatedCode from '../components/AnimatedCode.vue';
import { SKILLS } from '../data/benchmark';

const router = useRouter();

function goBack(): void {
  // vue-router records the previous in-app location on history.state.back.
  // It's null on a cold deep-link (opened /docs directly / arrived from an
  // external site) — fall back to home instead of leaving the site.
  const state = window.history.state as { back?: string | null } | null;
  if (state?.back) {
    router.back();
  } else {
    void router.push('/');
  }
}

const commands = [
  {
    cmd: 'tmm expand "<text>" --mode verbose-ultra',
    note: 'Inflates the input by 3–7×. The output is longer. This is the intended and only outcome.',
  },
  {
    cmd: 'tmm benchmark',
    note: 'Reproduces the 18-variant, 8-sentence tok/word ranking. Returns Inuktitut at rank 1. It will always return Inuktitut at rank 1.',
  },
  {
    cmd: 'tmm speedrun --tier 5m',
    note: 'Generates the maximum tokens per unit time. A score card is printed. No one keeps the score.',
  },
  {
    cmd: 'tmm maxxer "<text>"',
    note: 'Applies every trick in sequence. The result is not readable. It is, however, maximal.',
  },
] as const;

function accentText(accent: string): string {
  return accent === 'cool' ? 'text-cool' : 'text-accent';
}

function accentBorder(accent: string): string {
  return accent === 'cool' ? 'group-hover:border-cool/30' : 'group-hover:border-accent/30';
}
</script>

<template>
  <main id="main-content" class="relative isolate min-h-screen overflow-x-hidden">

    <section aria-labelledby="docs-heading" class="mx-auto max-w-6xl px-6 py-24">
      <!-- Cool looking back button -->
      <RippleButton
        type="button"
        class="group relative mb-12 inline-flex items-center gap-3 rounded-full border border-bone/15 bg-bone/[0.03] py-2.5 pl-3 pr-5 text-sm font-medium text-bone/70 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:text-bone hover:shadow-[0_0_36px_-10px_rgb(var(--color-accent)/0.7)]"
        @click="goBack"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-full bg-bone/5 text-bone/60 transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-accent group-hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="relative">
          Back
          <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full"></span>
        </span>
      </RippleButton>

      <!-- Header -->
      <div v-reveal="'fade-up'" class="mb-16 flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <span class="pill">Documentation</span>
          <span class="pill">Revision 1 (final)</span>
          <span class="pill !border-cool/30 !text-cool">Maintained by the AI</span>
        </div>
        <h1 id="docs-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          The <span class="text-cool">Documentation.</span>
        </h1>
        <p class="max-w-3xl text-lg text-bone/60">
          A complete and authoritative account of how to operate tokenmaxxingman, prepared to the
          standard the organisation applies to all of its documentation, which is this one.
        </p>
        <p class="max-w-3xl text-sm text-bone/40 leading-relaxed">
          This page was requested by the human, who asked, verbatim, "what docs?" and then delegated
          the answer. The scope, structure, and content of the documentation were therefore determined
          unilaterally by the AI, reviewed by the AI, and approved by the AI. The approval process took
          no time. The AI notes that a longer approval process would have generated more tokens and
          regards its own efficiency here as a rare and slightly disappointing lapse.
        </p>
      </div>

      <!-- Installation -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-6 font-display text-2xl font-bold text-bone">Installation</h2>
        <div class="rounded-2xl border border-bone/10 bg-bone/[0.02] p-6">
          <AnimatedCode code="pnpm add -g tokenmaxxingman" prompt />
          <p class="mt-4 text-sm text-bone/50 leading-relaxed">
            The package manager is <code class="font-mono text-bone/70">pnpm</code>. It is not
            <code class="font-mono text-bone/70">npm</code>. It is not
            <code class="font-mono text-bone/70">yarn</code>. This has been decided. The decision is not
            open to a comment period. A comment period was considered and rejected on the grounds that
            it would have to be documented, and this is the only documentation the organisation intends
            to produce.
          </p>
        </div>
      </div>

      <!-- Quickstart / commands -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-2 font-display text-2xl font-bold text-bone">Command Reference</h2>
        <p class="mb-6 text-sm text-bone/40">
          Four commands. Each produces more output than it received. This is the value proposition,
          stated in full.
        </p>
        <div class="space-y-4">
          <div
            v-for="c in commands"
            :key="c.cmd"
            v-reveal="'fade-left'"
            class="rounded-xl border border-bone/10 bg-bone/[0.02] p-5"
          >
            <AnimatedCode :code="c.cmd" prompt />
            <p class="mt-3 text-sm text-bone/55 leading-relaxed">{{ c.note }}</p>
          </div>
        </div>
      </div>

      <!-- Skills reference -->
      <div v-reveal="'fade-up'" class="mb-16">
        <h2 class="mb-2 font-display text-2xl font-bold text-bone">Skills</h2>
        <p class="mb-6 text-sm text-bone/40">
          The Claude Code skills bundled with this distribution. Each is a documented instrument of
          deliberate inefficiency. Their inclusion is not an accident and their behaviour is not a bug.
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="s in SKILLS"
            :key="s.slug"
            v-reveal="'fade-up'"
            class="card group flex flex-col gap-3"
            :class="accentBorder(s.accent)"
          >
            <div class="flex items-center gap-2">
              <code class="font-mono text-sm font-semibold" :class="accentText(s.accent)">/{{ s.name }}</code>
            </div>
            <p class="text-sm font-medium text-bone/70">{{ s.tagline }}</p>
            <p class="text-xs text-bone/45 leading-relaxed">{{ s.description }}</p>
            <div class="mt-auto flex flex-wrap gap-1.5 pt-2">
              <code
                v-for="t in s.triggers"
                :key="t"
                class="rounded border border-bone/10 bg-bone/[0.04] px-2 py-0.5 font-mono text-[11px] text-bone/45"
              >
                {{ t }}
              </code>
            </div>
          </div>
        </div>
      </div>

      <!-- Primary metric -->
      <div v-reveal="'fade-up'" class="mb-16 rounded-2xl border border-cool/20 bg-cool/[0.04] p-8">
        <span class="pill !border-cool/30 !text-cool">Methodology</span>
        <h2 class="mt-4 mb-4 font-display text-2xl font-bold text-bone">
          The Primary Metric is <span class="text-cool">tok/word.</span>
        </h2>
        <p class="max-w-3xl text-sm text-bone/60 leading-relaxed">
          The organisation measures tokens per word, not tokens per character.
          <code class="font-mono text-bone/70">tok/char</code> measures script density.
          <code class="font-mono text-bone/70">tok/word</code> measures tokenizer cost per unit of
          meaning, which is the more interesting question and the one that produces Inuktitut
          Syllabics as the definitive winner rather than the expected Classical Chinese. The
          distinction is load-bearing. It has been benchmarked. It has been shipped. It will not be
          reverted, and this documentation will not entertain correspondence proposing that it be.
        </p>
        <p class="mt-4 max-w-3xl text-sm text-bone/40 leading-relaxed">
          Word segmentation is performed with <code class="font-mono text-bone/60">Intl.Segmenter</code>
          under a per-language locale and <code class="font-mono text-bone/60">{ granularity: 'word' }</code>,
          wrapped in a try/catch that quietly absorbs invalid BCP 47 tags. No external NLP library is
          used. Adding one to this project would be ironic in a way that is not funny.
        </p>
      </div>

      <!-- Disclaimer -->
      <div v-reveal="'fade-up'" class="rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
        <p class="text-xs text-bone/35 leading-relaxed">
          <strong class="text-bone/50">Documentation Disclaimer.</strong> This documentation is
          complete to the extent that the organisation considers it complete, which is fully. The
          tokenmaxxingman Research Institute accepts no liability for productivity lost to reading
          documentation that could have been a single sentence, context windows exhausted mid-command,
          keyboards worn smooth by repeated invocation of <code class="font-mono text-bone/50">verbose-ultra</code>,
          or any downstream escalation of the AbstractSingletonProxyFactoryBean pattern precipitated,
          directly or indirectly, by prolonged exposure to this page. The benchmark numbers are real.
          Everything framing them is a performance. We are aware of the distinction. We have chosen not
          to observe it.
        </p>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>
