<script setup lang="ts">
import Hero from './components/Hero.vue';
import StatRow from './components/StatRow.vue';
import BenchmarkBarChart from './components/BenchmarkBarChart.vue';
import EncodingComparisonChart from './components/EncodingComparisonChart.vue';
import SkillsGrid from './components/SkillsGrid.vue';
import PipelineFlow from './components/PipelineFlow.vue';
import InstallSection from './components/InstallSection.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<template>
  <main class="relative isolate min-h-screen overflow-x-hidden">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60"></div>

    <Hero />
    <StatRow />

    <section id="benchmark" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">benchmark · cl100k_base</span>
        <h2 class="font-display text-4xl font-bold text-bone md:text-5xl">
          The naive hypothesis is <span class="text-accent">wrong.</span>
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          You would expect Classical Chinese to top the table — dense ideographs, surely the worst case
          for byte-pair encoding. It is not even close. Inuktitut Syllabics is
          <span class="font-mono text-bone">1.7×</span> worse than wenyan, and
          <span class="font-mono text-bone">10.4×</span> worse than English. The opposite of
          <a class="text-accent underline-offset-4 hover:underline" href="https://getcaveman.dev/">caveman</a>
          is not "more characters." It is <em class="italic">this</em>.
        </p>
      </div>
      <BenchmarkBarChart />
    </section>

    <section id="comparison" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">cl100k_base vs o200k_base</span>
        <h2 class="font-display text-4xl font-bold text-bone md:text-5xl">
          The newer tokenizer is <span class="text-cool">worse</span> at Inuktitut.
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          Every other non-Latin script gets better compression under <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-sm">o200k_base</code> —
          the newer, larger-vocabulary tokenizer. Inuktitut alone gets <strong class="text-bone">worse</strong>: 2.6158 → 2.6780 tok/char.
          The newer tokenizer learned more of the world. It did not learn more Inuktitut.
        </p>
      </div>
      <EncodingComparisonChart />
    </section>

    <section id="skills" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">four skills · zero external deps</span>
        <h2 class="font-display text-4xl font-bold text-bone md:text-5xl">
          The anti-skill family.
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          Each skill is a satirical inversion of a real concern — efficiency, citation rigor, signal density, directness.
          Each operates within a documented exemption boundary that auto-disables it on engineering work, security warnings,
          and anything where someone might act on the output.
        </p>
      </div>
      <SkillsGrid />
    </section>

    <section id="pipeline" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">deterministic · spec-driven · local-first</span>
        <h2 class="font-display text-4xl font-bold text-bone md:text-5xl">
          A pipeline you can audit.
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          No API calls. No external NLP libraries. No randomness. Every output for a given input is the same output, every
          time. The joke depends on the rigor. A baroque transformation performed inconsistently is just verbose.
        </p>
      </div>
      <PipelineFlow />
    </section>

    <section id="install" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 flex flex-col gap-3">
        <span class="pill">install · three paths</span>
        <h2 class="font-display text-4xl font-bold text-bone md:text-5xl">
          Pick a path. Ship today.
        </h2>
      </div>
      <InstallSection />
    </section>

    <SiteFooter />
  </main>
</template>
