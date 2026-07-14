<script setup lang="ts">
import { HEADLINE_STATS } from '../data/benchmark';

const tokenRatio = (HEADLINE_STATS.topRowO200k.tokensPerWord / HEADLINE_STATS.englishO200k.tokensPerWord).toFixed(1);
</script>

<template>
  <section aria-labelledby="hero-heading" class="relative isolate overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-32">
    <!-- ambient glows -->
    <div class="pointer-events-none absolute -top-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl"></div>
    <div class="pointer-events-none absolute top-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-cool/20 blur-3xl"></div>

    <div class="mx-auto max-w-6xl">
      <div class="mb-10 flex items-center gap-3">
        <svg aria-hidden="true" width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="rounded-lg">
          <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
          <rect x="4" y="20" width="6" height="10" rx="1.5" fill="#fafaf7" opacity="0.35"/>
          <rect x="13" y="12" width="6" height="18" rx="1.5" fill="#fafaf7" opacity="0.6"/>
          <rect x="22" y="4" width="6" height="26" rx="1.5" fill="#ff3d00"/>
        </svg>
        <span class="font-mono text-sm font-medium tracking-widest text-bone/50 uppercase">tokenmaxxingman</span>
      </div>
      <div class="mb-8 flex flex-wrap items-center gap-3">
        <span class="pill !text-accent !border-accent/30 !bg-accent/10">v0.0.21 · contributors + settings + dark/light</span>
        <span class="pill">100% open-source · MIT</span>
        <span class="pill">156 tests passing</span>
      </div>

      <h1 id="hero-heading" class="text-balance font-display text-5xl font-bold leading-[1.05] text-bone md:text-7xl lg:text-8xl">
        We mathematically proved the
        <br />
        <span class="bg-gradient-to-br from-accent-soft via-accent to-accent-dim bg-clip-text text-transparent">
          opposite of caveman.
        </span>
      </h1>

      <p class="mt-8 max-w-3xl text-balance text-xl text-bone/70 md:text-2xl">
        The most token-hostile human language on Earth is not Classical Chinese.
        It is not Burmese. It is not Tibetan. It is <strong class="text-bone">Inuktitut Syllabics</strong> —
        and under the newest tokenizer, it is getting <em class="italic">worse</em>.
      </p>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="#install"
          class="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 font-medium text-ink shadow-lg shadow-accent/30 transition-all hover:bg-accent-soft hover:shadow-accent/50"
        >
          Install now <span aria-hidden="true">→</span>
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-bone/20 px-7 py-3.5 font-medium text-bone transition-all hover:border-bone/40 hover:bg-bone/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          View on GitHub
        </a>
      </div>

      <div class="mt-20 grid grid-cols-2 gap-8 border-t border-bone/10 pt-12 md:grid-cols-4">
        <div>
          <div class="stat-figure text-5xl md:text-6xl">
            {{ HEADLINE_STATS.topRowO200k.tokensPerWord.toFixed(4) }}
          </div>
          <div class="mt-2 text-sm uppercase tracking-wider text-bone/50">tok/word (o200k)</div>
          <div class="mt-1 text-xs text-bone/40">Inuktitut, the empirical winner</div>
        </div>
        <div>
          <div class="stat-figure text-5xl md:text-6xl">{{ tokenRatio }}×</div>
          <div class="mt-2 text-sm uppercase tracking-wider text-bone/50">more tokens vs English</div>
          <div class="mt-1 text-xs text-bone/40">same words, same meaning</div>
        </div>
        <div>
          <div class="stat-figure text-5xl md:text-6xl">{{ HEADLINE_STATS.variantsTested }}</div>
          <div class="mt-2 text-sm uppercase tracking-wider text-bone/50">language variants</div>
          <div class="mt-1 text-xs text-bone/40">× 2 tokenizer encodings</div>
        </div>
        <div>
          <div class="stat-figure text-5xl md:text-6xl">{{ HEADLINE_STATS.externalNlpDeps }}</div>
          <div class="mt-2 text-sm uppercase tracking-wider text-bone/50">external NLP deps</div>
          <div class="mt-1 text-xs text-bone/40">deterministic pipeline only</div>
        </div>
      </div>
    </div>
  </section>
</template>
