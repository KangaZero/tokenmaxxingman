<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Hexagon size, centre to vertex (px). */
    size?: number;
  }>(),
  { size: 30 },
);

const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;
let width = 0;
let height = 0;

function strokeColor(): string {
  const cs = getComputedStyle(document.documentElement);
  const triplet = cs.getPropertyValue('--color-bone').trim() || '250 250 247';
  const [r, g, b] = triplet.split(/\s+/);
  return `rgba(${r}, ${g}, ${b}, 0.13)`;
}

function draw(): void {
  const c = ctx;
  if (!c || width === 0 || height === 0) return;

  c.clearRect(0, 0, width, height);
  c.lineWidth = 1;
  c.strokeStyle = strokeColor();
  c.beginPath();

  const s = props.size;
  const dx = 1.5 * s; // flat-top column spacing
  const dy = Math.sqrt(3) * s; // row spacing
  let col = 0;

  for (let cx = 0; cx <= width + s; cx += dx) {
    const offset = col % 2 === 1 ? dy / 2 : 0;
    for (let cy = offset - dy; cy <= height + s; cy += dy) {
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i; // flat-top: first vertex at 0°
        const x = cx + s * Math.cos(angle);
        const y = cy + s * Math.sin(angle);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
    }
    col += 1;
  }

  c.stroke();
}

function resize(): void {
  const cv = canvas.value;
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = cv.clientWidth;
  height = cv.clientHeight;
  cv.width = Math.round(width * dpr);
  cv.height = Math.round(height * dpr);
  ctx = cv.getContext('2d');
  ctx?.scale(dpr, dpr);
  draw();
}

onMounted(() => {
  resize();
  resizeObserver = new ResizeObserver(resize);
  if (canvas.value) resizeObserver.observe(canvas.value);
  themeObserver = new MutationObserver(draw);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
});
</script>

<template>
  <div class="hex-bg" aria-hidden="true">
    <canvas ref="canvas" class="hex-bg__canvas"></canvas>
    <div class="hex-bg__glow"></div>
  </div>
</template>

<style scoped>
.hex-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.hex-bg__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* A soft accent glow drifts across, so the honeycomb "lights up" in a wave. */
.hex-bg__glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 55vmax;
  height: 55vmax;
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgb(var(--color-accent) / 0.18), transparent 72%);
  mix-blend-mode: screen;
  animation: hex-glow-drift 26s ease-in-out infinite alternate;
}

@keyframes hex-glow-drift {
  from {
    transform: translate(-25vw, -20vh);
  }
  to {
    transform: translate(85vw, 70vh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hex-bg__glow {
    animation: none;
    transform: translate(30vw, 25vh);
  }
}
</style>
