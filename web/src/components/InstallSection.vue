<script setup lang="ts">
import AnimatedCode from './AnimatedCode.vue';

const paths = [
  {
    badge: 'recommended',
    title: 'Claude Code plugin',
    blurb: 'Two commands. Skills load directly into Claude Code.',
    accent: 'accent' as const,
    code: `/plugin marketplace add KangaZero/tokenmaxxingman
/plugin install tokenmaxxingman@tokenmaxxingman`,
  },
  {
    badge: 'CLI users',
    title: 'npm / pnpm / bun — the binary only',
    blurb: '`tokenmaxxingman` / `tmm` via npm, pnpm, or bun. Skills not auto-linked.',
    accent: 'cool' as const,
    code: `npm install -g tokenmaxxingman   # or: pnpm add -g / bun add -g
tmm benchmark

# or run once, no install:
npx tokenmaxxingman expand --mode maxlang   # or: pnpm dlx / bunx`,
  },
  {
    badge: 'contributors',
    title: 'Clone + install script',
    blurb: 'Symlinks each skill into ~/.claude/skills/. git pull = update.',
    accent: 'accent' as const,
    code: `git clone git@github.com:KangaZero/tokenmaxxingman.git
cd tokenmaxxingman
pnpm install && pnpm run build
./scripts/install-skills.sh`,
  },
];
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <article
      v-for="path in paths"
      :key="path.title"
      class="card flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <span
          class="rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider"
          :class="
            path.accent === 'accent'
              ? 'bg-accent/15 text-accent'
              : 'bg-cool/15 text-cool'
          "
        >
          {{ path.badge }}
        </span>
      </div>
      <h3 class="font-display text-2xl font-bold text-bone">{{ path.title }}</h3>
      <p class="text-sm text-bone/60">{{ path.blurb }}</p>
      <AnimatedCode :code="path.code" :filename="path.title" />
    </article>
  </div>

  <div class="surface mt-12 rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h4 class="font-display text-xl font-bold text-bone">Got <code class="font-mono text-accent">just</code>?</h4>
        <p class="mt-1 text-sm text-bone/70">
          Run any project command from one place: <code class="font-mono text-bone">just</code> shows the list,
          <code class="font-mono text-bone">just ci</code> runs the full gate, <code class="font-mono text-bone">just web-dev</code>
          spins this site up locally.
        </p>
      </div>
      <a
        href="https://github.com/casey/just"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex shrink-0 items-center justify-center rounded-full border border-accent/40 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/10"
      >
        Get just <span aria-hidden="true">→</span>
        <span class="sr-only">(opens in new tab)</span>
      </a>
    </div>
  </div>
</template>
