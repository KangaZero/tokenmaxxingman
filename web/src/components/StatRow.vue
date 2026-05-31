<script setup lang="ts">
import { computed } from 'vue';
import { HEADLINE_STATS } from '../data/benchmark';

const wenyanMultiplier = computed(() =>
  (HEADLINE_STATS.topRowCl100k.tokensPerCharacter / HEADLINE_STATS.wenyanCl100k.tokensPerCharacter).toFixed(2),
);

const o200kDelta = computed(() => {
  const cl = HEADLINE_STATS.topRowCl100k.tokensPerCharacter;
  const o = HEADLINE_STATS.topRowO200k.tokensPerCharacter;
  return (((o - cl) / cl) * 100).toFixed(1);
});

const stats = computed(() => [
  {
    label: 'Inuktitut beats wenyan by',
    figure: `${wenyanMultiplier.value}×`,
    note: 'tokens per character ratio',
  },
  {
    label: 'Inuktitut gets worse on o200k_base by',
    figure: `+${o200kDelta.value}%`,
    note: 'the only natural-language entry that worsens',
  },
  {
    label: 'Skills bundled in v0.0.1',
    figure: `${HEADLINE_STATS.skillsShipped}`,
    note: 'tokenmaxxingman, hallucinatemaxx, tokensprint, politician',
  },
  {
    label: 'Tests passing',
    figure: `${HEADLINE_STATS.testsPassing}`,
    note: 'deterministic, reproducible, no flaky surface',
  },
]);
</script>

<template>
  <section class="relative border-y border-bone/10 bg-bone/[0.02] py-16 backdrop-blur-sm">
    <div class="mx-auto grid max-w-6xl grid-cols-2 gap-12 px-6 md:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="text-center md:text-left">
        <div class="font-display text-4xl font-bold tabular-nums text-bone md:text-5xl">
          {{ stat.figure }}
        </div>
        <div class="mt-3 text-sm font-medium uppercase tracking-wider text-accent/90">
          {{ stat.label }}
        </div>
        <div class="mt-1 text-xs text-bone/50">{{ stat.note }}</div>
      </div>
    </div>
  </section>
</template>
