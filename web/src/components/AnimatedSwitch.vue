<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    ariaLabel?: string;
    disabled?: boolean;
  }>(),
  { ariaLabel: undefined, disabled: false },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [event: MouseEvent];
}>();

function onClick(event: MouseEvent, current: boolean, disabled: boolean): void {
  if (disabled) return;
  emit('update:modelValue', !current);
  emit('change', event);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    class="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'bg-accent' : 'bg-bone/20'"
    @click="onClick($event, modelValue, disabled)"
  >
    <span
      class="pointer-events-none inline-block h-5 w-5 rounded-full bg-bone shadow-sm ring-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-active:scale-90"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>
