<script setup lang="ts">
import { ref } from 'vue';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const ripples = ref<Ripple[]>([]);
let seq = 0;

function spawn(event: PointerEvent): void {
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const id = (seq += 1);
  ripples.value.push({
    id,
    x: event.clientX - rect.left - size / 2,
    y: event.clientY - rect.top - size / 2,
    size,
  });
  window.setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id);
  }, 600);
}
</script>

<template>
  <!-- Parent class/type/@click/aria-* fall through and merge onto this button. -->
  <button class="relative overflow-hidden" @pointerdown="spawn">
    <span
      v-for="r in ripples"
      :key="r.id"
      class="tmm-ripple"
      :style="{ left: `${r.x}px`, top: `${r.y}px`, width: `${r.size}px`, height: `${r.size}px` }"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>

<style scoped>
.tmm-ripple {
  position: absolute;
  border-radius: 9999px;
  background-color: currentColor;
  opacity: 0.3;
  pointer-events: none;
  transform: scale(0);
  animation: tmm-ripple 600ms ease-out forwards;
}
@keyframes tmm-ripple {
  to {
    transform: scale(1);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tmm-ripple {
    display: none;
    animation: none;
  }
}
</style>
