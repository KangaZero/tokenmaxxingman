<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AnimatedCode from './AnimatedCode.vue';
import { MCP_TOOLS, MCP_PROMPT_NAMES, MCP_REGISTER_CLI } from '../data/mcp';

const highlights = [
  {
    figure: `${MCP_TOOLS.length}`,
    label: 'tools',
    note: 'expand, maxx, count, benchmark, plan, list, fetch — all computed, none estimated',
    accent: 'accent' as const,
  },
  {
    figure: `${MCP_PROMPT_NAMES.length * 2 + 2}`,
    label: 'resources',
    note: `SKILL.md and EXAMPLES.md for all ${MCP_PROMPT_NAMES.length} skills, plus both benchmark encodings`,
    accent: 'cool' as const,
  },
  {
    figure: '0',
    label: 'side effects',
    note: 'no file writes, no spawned processes, no network — bundled and version-pinned',
    accent: 'accent' as const,
  },
];
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
    <div class="card flex flex-col gap-4">
      <span class="pill !border-accent/30 !text-accent">stdio · @modelcontextprotocol/sdk v1.30.0</span>
      <p class="text-base leading-relaxed text-bone/70">
        The skills used to <em class="italic">estimate</em> token counts and
        <em class="italic">approximate</em> expansions from inside the model. Connect the server and
        they call the same deterministic pipeline the CLI does — real numbers, reproducible output,
        no invented decimals.
      </p>
      <AnimatedCode :code="MCP_REGISTER_CLI" prompt />
      <RouterLink
        to="/docs#mcp"
        class="mt-auto inline-flex items-center gap-2 self-start rounded-full border border-accent/40 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/10"
      >
        Read the MCP reference <span aria-hidden="true">→</span>
      </RouterLink>
    </div>

    <ul class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
      <li v-for="item in highlights" :key="item.label" class="card flex flex-col gap-1">
        <span
          class="font-display text-4xl font-bold tabular-nums"
          :class="item.accent === 'accent' ? 'text-accent' : 'text-cool'"
        >
          {{ item.figure }}
        </span>
        <span class="text-sm font-medium uppercase tracking-wider text-bone/70">{{ item.label }}</span>
        <span class="text-xs leading-relaxed text-bone/45">{{ item.note }}</span>
      </li>
    </ul>
  </div>
</template>
