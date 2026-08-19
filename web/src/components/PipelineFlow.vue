<script setup lang="ts">
const stages = [
  { name: 'input', glyph: 'Use this.', amp: 1, note: 'plain English' },
  { name: 'synonyms', glyph: 'Utilize this.', amp: 1.4, note: 'Latinate substitution' },
  { name: 'qualifiers', glyph: 'It is, of course, important to note that utilize this…', amp: 4.2, note: 'hedge / suffix injection' },
  { name: 'nominalizations', glyph: '…carry out the utilization of this…', amp: 5.8, note: 'verb → noun phrase' },
  { name: 'passive', glyph: '…this is utilized…', amp: 6.3, note: 'voice inversion' },
  { name: 'translate', glyph: 'ᐊᑐᕐᓗᒍ ᐅᑯᓂᖓ…', amp: 15.7, note: 'render in iu-cans (maxlang)' },
];
const maxAmp = Math.max(...stages.map((s) => s.amp));
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(stage, i) in stages"
      :key="stage.name"
      class="card flex flex-col gap-3 md:flex-row md:items-center md:gap-6"
    >
      <div class="flex flex-shrink-0 items-center gap-4 md:w-56">
        <div
          aria-hidden="true"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 bg-bone/5 font-mono text-sm text-bone/70"
        >
          {{ i + 1 }}
        </div>
        <code class="font-mono text-sm font-medium text-accent">
          {{ stage.name }}
        </code>
      </div>

      <div class="flex-1 min-w-0">
        <p class="truncate font-display text-base text-bone/90">{{ stage.glyph }}</p>
        <p class="mt-0.5 text-xs text-bone/50">{{ stage.note }}</p>
      </div>

      <div class="flex flex-shrink-0 items-center gap-3 md:w-48">
        <div
          role="progressbar"
          :aria-valuenow="Math.round((stage.amp / maxAmp) * 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`${stage.name} amplification: ${stage.amp.toFixed(1)}×`"
          class="relative h-2 flex-1 overflow-hidden rounded-full bg-bone/10"
        >
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-soft to-accent"
            :style="{ width: `${(stage.amp / maxAmp) * 100}%` }"
          ></div>
        </div>
        <span class="w-12 text-right font-mono text-sm tabular-nums text-bone/70">
          {{ stage.amp.toFixed(1) }}×
        </span>
      </div>
    </div>
  </div>
</template>
