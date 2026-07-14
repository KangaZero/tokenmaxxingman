<script setup lang="ts">
import { useTheme } from '../composables/useTheme';
import RippleButton from './RippleButton.vue';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <RippleButton
    type="button"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    class="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    @click="toggleTheme"
  >
    <span class="relative block h-[18px] w-[18px]">
      <!-- Sun: visible in light mode -->
      <svg
        class="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :class="isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'"
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
      <!-- Moon: visible in dark mode -->
      <svg
        class="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :class="isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'"
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>
  </RippleButton>
</template>
