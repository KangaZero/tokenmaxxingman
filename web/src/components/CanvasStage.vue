<script setup lang="ts">
import type { VNode } from 'vue';
import { useCanvasStage, type CanvasThemeTokens } from '../composables/useCanvasStage';

/**
 * Host for one vendored Canvas UI 3D component.
 *
 * It owns the capability gate and nothing else: `useCanvasStage` decides whether
 * the WebGL layer may run, and this component picks the matching slot. Keeping
 * the vendored component itself in the caller's `#canvas` slot means the caller
 * keeps full prop type-checking on it, and — because the slot is not rendered
 * until the gate opens — a `defineAsyncComponent` in the caller keeps three.js
 * out of the initial route chunk.
 *
 * The root element is deliberately unpositioned and unsized. Canvas UI renders
 * its canvas `position: absolute; inset: 0`, so the caller must supply both the
 * positioning context and the height (e.g. `class="relative h-80"`); hardcoding
 * `relative` here would silently beat a caller's `absolute` in Tailwind's
 * cascade order.
 */
defineSlots<{
  /** The 3D component. Rendered only while the stage is active. */
  canvas(props: {
    theme: CanvasThemeTokens;
    glyphSrc: string;
    onError: (error: unknown) => void;
  }): VNode[];
  /** Static markup for reduced motion, missing WebGL2, or a failed asset. */
  fallback(): VNode[];
}>();

const { root, active, theme, glyphSrc, reportError } = useCanvasStage();
</script>

<template>
  <div ref="root" aria-hidden="true">
    <slot
      v-if="active"
      name="canvas"
      :theme="theme"
      :glyphSrc="glyphSrc"
      :onError="reportError"
    />
    <slot v-else name="fallback" />
  </div>
</template>
