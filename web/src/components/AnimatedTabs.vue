<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type ComponentPublicInstance } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

interface TabItem {
  readonly label: string;
  /** Route path — renders a RouterLink, active when it matches the current route. */
  readonly to?: string;
  /** Section id — renders a button, active when it equals `activeId`. */
  readonly id?: string;
}

const props = defineProps<{
  items: readonly TabItem[];
  /** Externally-controlled active section id (scroll-spy) for button-mode tabs. */
  activeId?: string | null;
}>();

const emit = defineEmits<{ select: [id: string] }>();

const route = useRoute();
const rootEl = ref<HTMLElement | null>(null);
const linkEls = ref<(HTMLElement | undefined)[]>([]);
const hoverIndex = ref<number | null>(null);

const activeIndex = computed<number>(() =>
  props.items.findIndex((it) => (it.to !== undefined ? it.to === route.path : it.id === props.activeId)),
);

// Resting state follows the active tab; hover/focus temporarily overrides it.
const highlightIndex = computed<number>(() => hoverIndex.value ?? activeIndex.value);

const indicator = ref<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

function measure(): void {
  const el = linkEls.value[highlightIndex.value];
  if (!el) {
    indicator.value = { ...indicator.value, opacity: 0 };
    return;
  }
  indicator.value = { left: el.offsetLeft, width: el.offsetWidth, opacity: 1 };
}

function setRef(el: Element | ComponentPublicInstance | null, index: number): void {
  const node = el && '$el' in el ? (el.$el as HTMLElement) : (el as HTMLElement | null);
  // Keep the array free of stale/detached nodes when tabs unmount or re-order.
  if (node) linkEls.value[index] = node;
  else linkEls.value[index] = undefined;
}

// Ignore synthetic hover on touch — pointerleave never fires there, so the
// highlight would otherwise stick after a tap.
function onEnter(event: PointerEvent, index: number): void {
  if (event.pointerType !== 'touch') hoverIndex.value = index;
}

function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null;
  if (!next || !rootEl.value?.contains(next)) hoverIndex.value = null;
}

watch(highlightIndex, () => nextTick(measure));
watch(() => route.path, () => nextTick(measure));
watch(() => props.activeId, () => nextTick(measure));
onMounted(() => {
  nextTick(measure);
  // Web fonts swap in after mount and change tab widths — re-measure once ready.
  document.fonts?.ready.then(measure).catch(() => {});
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => window.removeEventListener('resize', measure));

const tabClass = 'relative z-10 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-200';
</script>

<template>
  <div
    ref="rootEl"
    class="relative flex items-center gap-1"
    @pointerleave="hoverIndex = null"
    @focusout="onFocusOut"
  >
    <!-- Sliding highlight pill -->
    <div
      class="pointer-events-none absolute inset-y-0 my-auto h-8 rounded-md bg-bone/10 transition-all duration-300 ease-out"
      :style="{
        transform: `translateX(${indicator.left}px)`,
        width: `${indicator.width}px`,
        opacity: indicator.opacity,
      }"
      aria-hidden="true"
    />
    <template v-for="(item, i) in items" :key="item.to ?? item.id ?? i">
      <RouterLink
        v-if="item.to !== undefined"
        :ref="(el) => setRef(el, i)"
        :to="item.to"
        :class="[tabClass, i === activeIndex ? 'text-accent' : 'text-bone/60 hover:text-bone']"
        @pointerenter="onEnter($event, i)"
        @focusin="hoverIndex = i"
      >
        {{ item.label }}
      </RouterLink>
      <button
        v-else
        :ref="(el) => setRef(el, i)"
        type="button"
        :aria-current="i === activeIndex ? 'true' : undefined"
        :class="[tabClass, i === activeIndex ? 'text-accent' : 'text-bone/60 hover:text-bone']"
        @pointerenter="onEnter($event, i)"
        @focusin="hoverIndex = i"
        @click="item.id && emit('select', item.id)"
      >
        {{ item.label }}
      </button>
    </template>
  </div>
</template>
