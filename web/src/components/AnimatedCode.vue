<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import RippleButton from './RippleButton.vue';

const props = withDefaults(
  defineProps<{
    /** Raw code to display (also what gets copied). */
    code: string;
    /** Optional label shown in the window header. */
    filename?: string;
    /** Render a leading "$" shell prompt on each line (presentational only). */
    prompt?: boolean;
    /** Type the code in on scroll-into-view. */
    animate?: boolean;
    /** Milliseconds per character while typing. */
    typingSpeed?: number;
  }>(),
  { filename: '', prompt: false, animate: true, typingSpeed: 18 },
);

interface Token {
  text: string;
  cls: string;
}

function highlightLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, cls: 'text-bone/40 italic' }];
  const tokens: Token[] = [];
  let wordIndex = 0;
  for (const part of line.split(/(\s+)/)) {
    if (part === '' || /^\s+$/.test(part)) {
      tokens.push({ text: part, cls: '' });
      continue;
    }
    let cls = 'text-bone/80';
    if (/^["'].*["']$/.test(part)) cls = 'text-emerald-400';
    else if (/^-/.test(part)) cls = 'text-accent';
    else if (wordIndex === 0) cls = 'text-cool';
    tokens.push({ text: part, cls });
    wordIndex += 1;
  }
  return tokens;
}

const tokens = computed<Token[]>(() => {
  const lines = props.code.split('\n');
  const out: Token[] = [];
  lines.forEach((line, i) => {
    out.push(...highlightLine(line));
    if (i < lines.length - 1) out.push({ text: '\n', cls: '' });
  });
  return out;
});

const offsets = computed<number[]>(() => {
  const arr: number[] = [];
  let acc = 0;
  for (const t of tokens.value) {
    arr.push(acc);
    acc += t.text.length;
  }
  return arr;
});

const total = computed<number>(() => props.code.length);
const visibleCount = ref(0);
const done = computed<boolean>(() => visibleCount.value >= total.value);

function visibleText(index: number): string {
  const start = offsets.value[index] ?? 0;
  const avail = visibleCount.value - start;
  if (avail <= 0) return '';
  const t = tokens.value[index];
  if (!t) return '';
  return avail >= t.text.length ? t.text : t.text.slice(0, avail);
}

const root = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let timer = 0;

function startTyping(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!props.animate || reduce) {
    visibleCount.value = total.value;
    return;
  }
  timer = window.setInterval(() => {
    visibleCount.value += 1;
    if (visibleCount.value >= total.value) {
      window.clearInterval(timer);
      timer = 0;
    }
  }, props.typingSpeed);
}

const copied = ref(false);
async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch {
    /* clipboard unavailable (insecure context) — no-op */
  }
}

onMounted(() => {
  const el = root.value;
  if (!el) {
    startTyping();
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        startTyping();
        observer?.disconnect();
        observer = null;
      }
    },
    { threshold: 0.2 },
  );
  observer.observe(el);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  observer?.disconnect();
});
</script>

<template>
  <div ref="root" class="overflow-hidden rounded-lg border border-bone/10 bg-ink/60" role="group" :aria-label="filename || 'code block'">
    <!-- Window header -->
    <div class="flex items-center justify-between border-b border-bone/10 bg-bone/[0.03] px-3 py-2">
      <div class="flex items-center gap-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-accent/70"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-bone/25"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-bone/15"></span>
        <span v-if="filename" class="ml-2 font-mono text-xs text-bone/45">{{ filename }}</span>
      </div>
      <RippleButton
        type="button"
        class="rounded-md px-2 py-1 font-mono text-[11px] text-bone/50 transition-colors hover:bg-bone/10 hover:text-bone"
        :aria-label="copied ? 'Copied' : 'Copy code'"
        @click="copy"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </RippleButton>
    </div>

    <!-- Accessible raw source (typing is purely visual). -->
    <span class="sr-only">{{ code }}</span>

    <pre
      aria-hidden="true"
      class="overflow-x-auto p-4 font-mono text-xs leading-relaxed"
    ><code><template v-for="(t, i) in tokens" :key="i"><span
      v-if="prompt && (i === 0 || tokens[i - 1]?.text === '\n')"
      class="select-none text-accent/60"
    >$ </span><span :class="t.cls">{{ visibleText(i) }}</span></template><span
      v-if="!done && animate"
      class="ml-0.5 inline-block w-1.5 animate-pulse bg-bone/60"
      aria-hidden="true"
    >&nbsp;</span></code></pre>
  </div>
</template>
