<script setup lang="ts">
import { SKILLS } from '../data/benchmark';
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <article
      v-for="skill in SKILLS"
      :key="skill.slug"
      class="card group flex flex-col gap-4 hover:-translate-y-1"
      :class="skill.accent === 'accent' ? 'hover:glow-accent' : 'hover:glow-cool'"
    >
      <div class="flex items-baseline justify-between">
        <h3 class="font-display text-2xl font-bold text-bone">
          /<span :class="skill.accent === 'accent' ? 'text-accent' : 'text-cool'">{{ skill.name }}</span>
        </h3>
      </div>
      <p class="font-display text-lg leading-snug text-bone/80">
        {{ skill.tagline }}
      </p>
      <p class="text-sm leading-relaxed text-bone/60">
        {{ skill.description }}
      </p>
      <div class="mt-auto flex flex-wrap gap-2 pt-2">
        <code
          v-for="trigger in skill.triggers"
          :key="trigger"
          class="rounded-full bg-bone/5 px-2.5 py-1 font-mono text-xs text-bone/70"
        >
          {{ trigger }}
        </code>
      </div>
    </article>
  </div>
</template>
