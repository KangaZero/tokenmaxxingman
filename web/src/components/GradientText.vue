<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Text to render (or use the default slot). */
    text?: string;
    /** Gradient stops. Defaults to the theme line spectrum from style.css. */
    colors?: string[];
    /** Seconds per gradient sweep. */
    animationSpeed?: number;
    /** Render an animated gradient border around the text. */
    showBorder?: boolean;
  }>(),
  { text: '', colors: undefined, animationSpeed: 8, showBorder: false },
);

// Reuse the per-theme palette (rgb triplets defined in style.css) so the
// gradient stays DRY and theme-aware; callers may override via `colors`.
const DEFAULT_STOPS = [
  'rgb(var(--gradient-line-1))',
  'rgb(var(--gradient-line-2))',
  'rgb(var(--gradient-line-3))',
  'rgb(var(--gradient-line-4))',
  'rgb(var(--gradient-line-5))',
];

const gradient = computed<string>(() => {
  const stops = props.colors && props.colors.length > 0 ? props.colors : DEFAULT_STOPS;
  return `linear-gradient(to right, ${stops.join(', ')})`;
});

const styleVars = computed(() => ({
  '--tmm-gradient': gradient.value,
  '--tmm-speed': `${props.animationSpeed}s`,
}));
</script>

<template>
  <span class="tmm-gradient-text" :class="{ 'tmm-has-border': showBorder }" :style="styleVars">
    <span v-if="showBorder" class="tmm-gradient-border" aria-hidden="true"></span>
    <span class="tmm-gradient-content"><slot>{{ text }}</slot></span>
  </span>
</template>

<style scoped>
.tmm-gradient-text {
  position: relative;
  display: inline-block;
}

.tmm-gradient-content {
  display: inline-block;
  background: var(--tmm-gradient);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: tmm-gradient-flow var(--tmm-speed) linear infinite;
}

/* Optional animated gradient border (react-bits `showBorder`). */
.tmm-has-border {
  border-radius: 0.5rem;
  padding: 0.25em 0.5em;
}
.tmm-gradient-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: var(--tmm-gradient);
  background-size: 300% 100%;
  animation: tmm-gradient-flow var(--tmm-speed) linear infinite;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes tmm-gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tmm-gradient-content,
  .tmm-gradient-border {
    animation: none;
  }
}
</style>
