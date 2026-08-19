<script setup lang="ts">
/**
 * The favicon motif — three ascending bars — as flat, theme-aware SVG.
 *
 * This is the static counterpart to the vendored Canvas UI 3D components: the
 * silhouette they extrude is generated from exactly these rectangles (see
 * `tokenBarsSvg` in `composables/useCanvasStage.ts`), so the reduced-motion,
 * no-WebGL and asset-failure paths still show the same shape, just without the
 * studio lighting. Purely decorative, hence `aria-hidden`.
 */
</script>

<template>
  <svg
    class="token-bars"
    viewBox="0 0 32 32"
    role="presentation"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="20" width="6" height="10" rx="1.5" class="token-bars__bone" />
    <rect x="13" y="12" width="6" height="18" rx="1.5" class="token-bars__cool" />
    <rect x="22" y="4" width="6" height="26" rx="1.5" class="token-bars__accent" />
  </svg>
</template>

<style scoped>
.token-bars {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Same theme tokens the 3D layer resolves, so light and dark match. */
.token-bars__bone {
  fill: rgb(var(--color-bone) / 0.35);
}
.token-bars__cool {
  fill: rgb(var(--color-cool) / 0.55);
}
.token-bars__accent {
  fill: rgb(var(--color-accent) / 0.85);
}
</style>
