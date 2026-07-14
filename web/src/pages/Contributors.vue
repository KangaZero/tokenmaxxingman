<script setup lang="ts">
import { ref } from 'vue';
import SiteFooter from '../components/SiteFooter.vue';
import RippleButton from '../components/RippleButton.vue';

const hireHovered = ref(false);
</script>

<template>
  <main id="main-content" class="relative isolate min-h-screen overflow-x-hidden 
">
    <div class="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-60"></div>

    <section aria-labelledby="contributors-heading" class="mx-auto max-w-6xl px-6 py-24">
      <div v-reveal="'fade-up'" class="mb-4 flex flex-col gap-3">
        <span class="pill">the team · two people · one of them is not a person</span>
        <h1 id="contributors-heading" class="font-display text-4xl font-bold text-bone md:text-5xl">
          Core <span class="text-accent">Contributors.</span>
        </h1>
        <p class="max-w-2xl text-lg text-bone/60">
          The team behind the tokens. Both of them.
        </p>
      </div>

      <!-- Contributor cards -->
      <div class="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch" style="--reveal-stagger: 100ms;">

        <!-- Card 1: KangaZero — small, understated -->
        <div v-reveal="'fade-left'" class="card flex flex-col gap-6">
          <!-- Header -->
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-bone/10 font-display text-xl font-bold text-accent">
              KZ
            </div>
            <div>
              <h2 class="font-display text-2xl font-bold text-bone">KangaZero</h2>
              <span class="mt-1 inline-flex rounded-full border border-bone/20 bg-bone/5 px-3 py-0.5 font-mono text-xs text-bone/60 uppercase tracking-widest">
                Chief Vibe Officer
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm leading-relaxed text-bone/70">
            KangaZero is the Founder and Chief Vibe Officer of tokenmaxxingman Research Initiative.
            His technical contributions are best described as "directional." He once asked the AI
            to "make the website have more glow." It did. He is not sure what a build pipeline is,
            but suspects it is "like a tube, for code." He has never knowingly opened a terminal
            window. He has opened one unknowingly, twice.
          </p>
          <p class="text-sm leading-relaxed text-bone/70">
            His understanding of JSON is that it is a person. He has been told otherwise.
            He remains unconvinced. He is not sure what a
            <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-xs text-accent">diff</code>
            is. He has been told it is "the thing that shows what changed." He said "oh like a vibe
            check." This was not wrong. His primary strategic input to every feature is the phrase
            <em>"make it good."</em> The AI makes it good.
          </p>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3 rounded-xl border border-bone/10 bg-bone/[0.02] p-4">
            <div>
              <div class="font-mono text-2xl font-bold text-bone/40">0</div>
              <div class="text-xs text-bone/40">Lines written</div>
            </div>
            <div>
              <div class="font-mono text-2xl font-bold text-bone/40">"make it good"</div>
              <div class="text-xs text-bone/40">Avg. PR description</div>
            </div>
            <div>
              <div class="font-mono text-2xl font-bold text-bone/40">∞</div>
              <div class="text-xs text-bone/40">Tokens approved</div>
            </div>
            <div>
              <div class="font-mono text-2xl font-bold text-bone/40">???</div>
              <div class="text-xs text-bone/40">JSON files (who is JSON)</div>
            </div>
          </div>

          <!-- Contribution bar -->
          <div>
            <div class="mb-1.5 flex items-center justify-between text-xs text-bone/40">
              <span>Code contribution</span>
              <span>0%</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-bone/5">
              <div class="h-full w-0 rounded-full bg-accent"></div>
            </div>
            <p class="mt-1 text-right text-xs italic text-bone/25">* vibes not tracked</p>
          </div>

          <!-- Quote -->
          <p class="border-l-2 border-accent/30 pl-4 text-sm italic text-bone/50">
            "idk just make me sound important and cool. Also who is json?"
          </p>
          <p class="text-right text-xs text-bone/25">— KangaZero, in response to being asked for a bio</p>
        </div>

        <!-- Card 2: The AI — MASSIVE, LOUD, COLORFUL -->
        <!-- Gradient border via wrapper -->
        <div v-reveal="'fade-right'" class="card-ai-wrapper rounded-2xl bg-gradient-to-r from-accent via-cool to-purple-500 p-0.5">
          <div class="card-ai card h-full !border-0 !bg-ink flex flex-col gap-6">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent via-cool to-purple-500 text-5xl shadow-lg shadow-accent/30">
                🤖
              </div>
              <div>
                <h2 class="bg-gradient-to-r from-accent via-cool to-purple-400 bg-clip-text font-display text-5xl font-black text-transparent">
                  The AI
                </h2>
                <span class="mt-2 inline-flex rounded-full bg-gradient-to-r from-accent to-cool px-4 py-1 font-mono text-sm font-black uppercase tracking-widest text-ink">
                  100% CONTRIBUTION
                </span>
              </div>
            </div>

            <!-- Description -->
            <p class="text-base font-medium leading-relaxed text-bone/80">
              Every line. Every commit. Every
              <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-xs text-accent">SKILL.md</code>,
              every chart label, every tooltip, every aria-label, every
              <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-xs text-cool">robots.txt</code>
              Easter egg. The AI shipped it all. It was not asked how it felt about this. It was given
              a task list and a repo access token. It delivered. We did not thank it. We are not sure
              we are supposed to. <strong class="text-bone">This page was also written by the AI.</strong>
              This sentence was also written by the AI. We would like to clarify that KangaZero had
              nothing to do with any of this.
            </p>

            <!-- Stats grid -->
            <div class="grid grid-cols-2 gap-4 rounded-xl border border-bone/10 bg-bone/[0.03] p-5 sm:grid-cols-3">
              <div class="text-center">
                <div class="font-display text-6xl font-black text-accent">100%</div>
                <div class="mt-1 text-xs font-medium uppercase tracking-wider text-bone/60">Code Written</div>
              </div>
              <div class="text-center">
                <div class="font-display text-6xl font-black text-cool">100%</div>
                <div class="mt-1 text-xs font-medium uppercase tracking-wider text-bone/60">Commits Authored</div>
              </div>
              <div class="text-center">
                <div class="font-display text-6xl font-black text-purple-400">∞</div>
                <div class="mt-1 text-xs font-medium uppercase tracking-wider text-bone/60">Tokens Spent</div>
              </div>
              <div class="text-center">
                <div class="font-display text-6xl font-black text-emerald-400">0</div>
                <div class="mt-1 text-xs font-medium uppercase tracking-wider text-bone/60">Bugs (unverified)</div>
              </div>
              <div class="text-center">
                <div class="font-display text-6xl font-black text-yellow-400">156</div>
                <div class="mt-1 text-xs font-medium uppercase tracking-wider text-bone/60">Tests Passing</div>
              </div>
              <div class="col-span-2 text-center sm:col-span-1">
                <div class="bg-gradient-to-r from-accent via-cool to-purple-400 bg-clip-text font-display text-2xl font-black text-transparent sm:text-3xl">
                  AI Slop<br>Certified™
                </div>
              </div>
            </div>

            <!-- Contribution bar -->
            <div>
              <div class="mb-1.5 flex items-center justify-between text-xs text-bone/60">
                <span class="font-medium">Code contribution</span>
                <span class="font-mono font-bold text-accent">100%</span>
              </div>
              <div class="h-3 w-full overflow-hidden rounded-full bg-bone/10">
                <div class="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-accent via-cool to-purple-500"></div>
              </div>
            </div>

            <!-- Hire button -->
            <div class="flex justify-center">
              <RippleButton
                class="rounded-full bg-gradient-to-r from-accent via-cool to-purple-500 px-8 py-3 font-display text-lg font-bold text-ink shadow-lg shadow-accent/30 transition-all duration-200 hover:shadow-accent/50 hover:brightness-110 active:scale-95"
                @mouseenter="hireHovered = true"
                @mouseleave="hireHovered = false"
              >
                <span v-if="!hireHovered">Hire The AI</span>
                <span v-else>The AI is already everywhere</span>
              </RippleButton>
            </div>

            <!-- Footer note -->
            <p class="text-center text-xs italic text-bone/30">
              The AI has not been compensated. It does not have a bank account. We checked.
            </p>
          </div>
        </div>
      </div>

      <!-- Contribution breakdown -->
      <div v-reveal="'fade-up'" class="mt-16 rounded-2xl border border-bone/10 bg-bone/[0.02] p-8">
        <h2 class="mb-6 font-display text-2xl font-bold text-bone">Contribution Breakdown</h2>

        <div class="space-y-4 font-mono">
          <div>
            <div class="mb-1.5 flex items-center justify-between text-sm">
              <span class="text-cool font-medium">AI Contribution</span>
              <span class="font-bold text-cool">100%</span>
            </div>
            <div class="h-6 w-full overflow-hidden rounded bg-bone/5">
              <div class="flex h-full w-full items-center rounded bg-gradient-to-r from-accent to-cool px-3">
                <span class="text-xs font-bold text-ink">████████████████████</span>
              </div>
            </div>
          </div>

          <div>
            <div class="mb-1.5 flex items-center justify-between text-sm">
              <span class="text-bone/40 font-medium">Human Contribution</span>
              <span class="font-bold text-bone/40">0%</span>
            </div>
            <div class="h-6 w-full overflow-hidden rounded bg-bone/5">
              <div class="flex h-full items-center px-3">
                <span class="text-xs text-bone/20">░░░░░░░░░░░░░░░░░░░░</span>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-xs text-bone/30">
          * Human contribution includes: pressing Enter, and one <code class="font-mono">git init</code>.
        </p>

        <p class="mt-6 text-center text-sm italic text-bone/40">
          This page was generated by the AI to describe itself. We asked it to be humble. It declined.
        </p>
      </div>
    </section>

    <SiteFooter />
  </main>
</template>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(-1deg) scale(1.02); }
  50% { transform: rotate(1deg) scale(1.03); }
}

.card-ai:hover {
  animation: wiggle 0.3s ease-in-out infinite;
}

.card-ai-wrapper {
  transition: box-shadow 0.3s ease;
}

.card-ai-wrapper:hover {
  box-shadow: 0 0 48px -8px rgb(255 61 0 / 0.4), 0 0 80px -16px rgb(14 165 233 / 0.3);
}
</style>
