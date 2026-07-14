<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';

const { isDark, toggleTheme } = useTheme();
const mobileOpen = ref(false);
const route = useRoute();
const router = useRouter();

const sections = [
  { id: 'benchmark', label: 'Benchmark' },
  { id: 'comparison', label: 'Compare' },
  { id: 'skills', label: 'Skills' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'install', label: 'Install' },
] as const;

function scrollTo(id: string) {
  if (route.path === '/') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  } else {
    router.push(`/#${id}`);
  }
  mobileOpen.value = false;
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-bone/10 bg-ink/80 backdrop-blur-md">
    <nav aria-label="Main navigation" class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

      <!-- Logo -->
      <RouterLink to="/" class="flex flex-shrink-0 items-center gap-2.5 focus-visible:rounded-md" @click="mobileOpen = false">
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="rounded-md flex-shrink-0">
          <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
          <rect x="4" y="20" width="6" height="10" rx="1.5" fill="#fafaf7" opacity="0.35"/>
          <rect x="13" y="12" width="6" height="18" rx="1.5" fill="#fafaf7" opacity="0.6"/>
          <rect x="22" y="4" width="6" height="26" rx="1.5" fill="#ff3d00"/>
        </svg>
        <span class="hidden font-mono text-sm font-semibold tracking-tight text-bone sm:block">tokenmaxxingman</span>
      </RouterLink>

      <!-- Desktop: section jump links -->
      <div class="hidden items-center gap-1 md:flex" aria-label="Page sections">
        <button
          v-for="s in sections"
          :key="s.id"
          type="button"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="scrollTo(s.id)"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Desktop: page links + theme toggle -->
      <div class="hidden items-center gap-1 md:flex">
        <RouterLink
          to="/about"
          active-class="text-accent"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="mobileOpen = false"
        >
          About
        </RouterLink>
        <RouterLink
          to="/contributors"
          active-class="text-accent"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="mobileOpen = false"
        >
          Team
        </RouterLink>
        <RouterLink
          to="/investors"
          active-class="text-accent"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="mobileOpen = false"
        >
          Investors
        </RouterLink>
        <RouterLink
          to="/testimonials"
          active-class="text-accent"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="mobileOpen = false"
        >
          Testimonials
        </RouterLink>
        <RouterLink
          to="/settings"
          active-class="text-accent"
          class="rounded-md px-2.5 py-1.5 text-sm text-bone/60 transition-colors hover:bg-bone/8 hover:text-bone"
          @click="mobileOpen = false"
        >
          Settings
        </RouterLink>

        <div class="ml-1 h-5 w-px bg-bone/15" aria-hidden="true"></div>

        <button
          type="button"
          class="rounded-lg p-2 text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <!-- Moon: shown when dark -->
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <!-- Sun: shown when light -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
      </div>

      <!-- Mobile: hamburger -->
      <div class="flex items-center gap-2 md:hidden">
        <button
          type="button"
          class="rounded-lg p-2 text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>

        <button
          type="button"
          class="rounded-lg p-2 text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <!-- Hamburger -->
          <svg v-if="!mobileOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <!-- X -->
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        class="border-b border-bone/10 bg-ink/95 backdrop-blur-md md:hidden"
      >
        <div class="mx-auto max-w-7xl space-y-1 px-4 pb-4 pt-2 sm:px-6">
          <p class="pb-1 pt-2 text-xs font-medium uppercase tracking-widest text-bone/30">Sections</p>
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="block w-full rounded-md px-3 py-2 text-left text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="scrollTo(s.id)"
          >
            {{ s.label }}
          </button>

          <div class="my-2 h-px bg-bone/10" aria-hidden="true"></div>

          <RouterLink
            to="/about"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            About
          </RouterLink>
          <RouterLink
            to="/contributors"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            Team
          </RouterLink>
          <RouterLink
            to="/investors"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            Investors
          </RouterLink>
          <RouterLink
            to="/testimonials"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            Testimonials
          </RouterLink>
          <RouterLink
            to="/settings"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
