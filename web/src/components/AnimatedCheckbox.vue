<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  id?: string;
  ariaLabel?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

function toggle(): void {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    :id="id"
    type="button"
    role="checkbox"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    class="group inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    :class="modelValue ? 'border-accent bg-accent' : 'border-bone/30 bg-bone/5 hover:border-bone/50'"
    @click="toggle"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="text-ink">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="check-path"
        :class="{ checked: modelValue }"
      />
    </svg>
  </button>
</template>

<style scoped>
.check-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  transition: stroke-dashoffset 220ms ease-out;
}
.check-path.checked {
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: reduce) {
  .check-path {
    transition: none;
  }
}
</style>
