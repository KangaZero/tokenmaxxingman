<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import Hero from '../components/Hero.vue';
import StatRow from '../components/StatRow.vue';
import BenchmarkBarChart from '../components/BenchmarkBarChart.vue';
import EncodingComparisonChart from '../components/EncodingComparisonChart.vue';
import SkillsGrid from '../components/SkillsGrid.vue';
import PipelineFlow from '../components/PipelineFlow.vue';
import McpTeaser from '../components/McpTeaser.vue';
import InstallSection from '../components/InstallSection.vue';
import SiteFooter from '../components/SiteFooter.vue';
import CanvasStage from '../components/CanvasStage.vue';
import TokenBarsMotif from '../components/TokenBarsMotif.vue';

// Both Canvas UI stages sit well below the fold, so they are async on two
// counts: three.js stays out of the initial chunk, and CanvasStage only mounts
// them once they scroll into range.
const DitheredObject = defineAsyncComponent(
  () => import('../components/canvasui/DitheredObject.vue'),
);
const ParticleObject = defineAsyncComponent(
  () => import('../components/canvasui/ParticleObject.vue'),
);
</script>

<template>
  <main id="main-content" class="relative min-h-screen overflow-x-hidden 
">

    <Hero />
    <StatRow />

    <section id="benchmark" aria-labelledby="benchmark-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div v-reveal="'fade-up'" class="flex flex-col gap-3">
          <span class="pill">benchmark · cl100k_base</span>
          <h2 id="benchmark-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
            The naive hypothesis is <span class="text-accent">wrong.</span>
          </h2>
          <p class="max-w-3xl text-lg text-bone/70">
            You would expect Finnish or Turkish to top the table — agglutinative morphology,
            one surface form for what English needs an entire phrase. It is not even close.
            Inuktitut is polysynthetic: a single word encodes an entire clause.
            That word costs <span class="font-mono text-bone">21</span> tokens.
            <span class="font-mono text-bone">7.2×</span> worse than Classical Chinese, and
            <span class="font-mono text-bone">16.7×</span> worse than English. Maximal token
            expenditure is not "more words." It is <em class="italic">this</em>.
          </p>
        </div>

        <!-- Canvas UI DitheredObject: the motif quantised to a 1-bit halftone -->
        <!-- screen, which is the same lossy-compression argument the section   -->
        <!-- makes about vocabulary size, rendered in one dimension fewer.      -->
        <CanvasStage class="relative hidden aspect-square w-full lg:block">
          <template #canvas="{ theme, glyphSrc, onError }">
            <DitheredObject
              class="h-full w-full"
              :src="glyphSrc"
              method="halftone"
              :grid-size="5"
              :pixel-size-ratio="1.4"
              :grayscale="false"
              :highlight="theme.accent"
              :environment-intensity="0.35"
              :scale="2.4"
              :float-intensity="1.4"
              :rotation-intensity="0.8"
              :float-speed="1.2"
              :orbit="false"
              :zoom="false"
              :auto-rotate="true"
              :auto-rotate-speed="0.8"
              :onError="onError"
            />
          </template>
          <template #fallback>
            <TokenBarsMotif class="absolute inset-0 m-auto h-2/3 w-2/3 opacity-40" />
          </template>
        </CanvasStage>
      </div>
      <BenchmarkBarChart />
    </section>

    <section id="comparison" aria-labelledby="comparison-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div v-reveal="'fade-up'" class="mb-12 flex flex-col gap-3">
        <span class="pill">cl100k_base vs o200k_base</span>
        <h2 id="comparison-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          The newer tokenizer is <span class="text-cool">worse</span> at Inuktitut.
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          Every other non-Latin script gets better compression under <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-sm">o200k_base</code> —
          the newer, larger-vocabulary tokenizer. Inuktitut alone gets <strong class="text-bone">worse</strong>: 21.0455 → 21.5455 tok/word.
          The newer tokenizer learned more of the world. It did not learn more Inuktitut.
        </p>
      </div>
      <EncodingComparisonChart />
    </section>

    <section id="skills" aria-labelledby="skills-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div v-reveal="'fade-up'" class="mb-12 flex flex-col gap-3">
        <span class="pill">five skills · zero external deps</span>
        <h2 id="skills-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
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

    <section id="pipeline" aria-labelledby="pipeline-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div v-reveal="'fade-up'" class="mb-12 flex flex-col gap-3">
        <span class="pill">deterministic · spec-driven · local-first</span>
        <h2 id="pipeline-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          A pipeline you can audit.
        </h2>
        <p class="max-w-3xl text-lg text-bone/70">
          No API calls. No external NLP libraries. No randomness. Every output for a given input is the same output, every
          time. The joke depends on the rigor. A baroque transformation performed inconsistently is just verbose.
        </p>
      </div>
      <PipelineFlow />
    </section>

    <section id="mcp" aria-labelledby="mcp-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div v-reveal="'fade-up'" class="flex flex-col gap-3">
          <span class="pill">new · MCP server · stdio</span>
          <h2 id="mcp-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
            The skills stopped <span class="text-accent">guessing.</span>
          </h2>
          <p class="max-w-3xl text-lg text-bone/70">
            MCP — the Model Context Protocol — is the open JSON-RPC standard by which an AI client calls
            tools, reads resources, and loads prompts from a separate server process. The package now
            ships one, so every figure the skills report is measured rather than imagined. The
            organisation regards this as an improvement it is contractually obliged to describe as minor.
          </p>
        </div>

        <!-- Canvas UI ParticleObject: the motif dissolved into a cursor-reactive -->
        <!-- point cloud that springs back into shape, which is the closest a     -->
        <!-- decoration gets to depicting tokenisation and detokenisation.        -->
        <CanvasStage class="relative hidden aspect-square w-full lg:block">
          <template #canvas="{ theme, glyphSrc, onError }">
            <ParticleObject
              class="h-full w-full"
              :src="glyphSrc"
              :count="9000"
              :size="2"
              :size-variance="0.7"
              :color="theme.accentSoft"
              :radius="130"
              :strength="1.1"
              :swirl="0.7"
              :spring="1.1"
              :damping="0.35"
              :drift="0.5"
              :scale="2.4"
              :float-intensity="1.4"
              :rotation-intensity="0.8"
              :float-speed="1.2"
              :orbit="false"
              :zoom="false"
              :auto-rotate="true"
              :auto-rotate-speed="0.7"
              :onError="onError"
            />
          </template>
          <template #fallback>
            <TokenBarsMotif class="absolute inset-0 m-auto h-2/3 w-2/3 opacity-40" />
          </template>
        </CanvasStage>
      </div>
      <McpTeaser />
    </section>

    <section id="install" aria-labelledby="install-heading" class="relative mx-auto max-w-6xl px-6 py-24">
      <div v-reveal="'fade-up'" class="mb-12 flex flex-col gap-3">
        <span class="pill">install · three paths</span>
        <h2 id="install-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          Pick a path. Ship today.
        </h2>
      </div>
      <InstallSection />
    </section>

    <SiteFooter />
  </main>
</template>
