<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AnimatedTabs from './AnimatedTabs.vue';
import ThemeToggler from './ThemeToggler.vue';
import RippleButton from './RippleButton.vue';

const mobileOpen = ref(false);
const route = useRoute();
const router = useRouter();
const activeSection = ref<string | null>(null);

const sections = [
  { id: 'benchmark', label: 'Benchmark' },
  { id: 'comparison', label: 'Compare' },
  { id: 'skills', label: 'Skills' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'mcp', label: 'MCP' },
  { id: 'install', label: 'Install' },
] as const;

const pageLinks = [
  { to: '/about', label: 'About' },
  { to: '/contributors', label: 'Team' },
  { to: '/investors', label: 'Investors' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/docs', label: 'Docs' },
  { to: '/settings', label: 'Settings' },
] as const;

function scrollTo(id: string) {
  if (route.path === '/') {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  } else {
    router.push(`/#${id}`);
  }
  mobileOpen.value = false;
}

// Scroll-spy: report which section owns the viewport centre so the section
// tabs' highlight rests on the current section. Only active on the home page.
let observer: IntersectionObserver | null = null;

function teardownSpy(): void {
  observer?.disconnect();
  observer = null;
}

function setupSpy(): void {
  teardownSpy();
  if (route.path !== '/') {
    activeSection.value = null;
    return;
  }
  const els = sections
    .map((s) => document.getElementById(s.id))
    .filter((el): el is HTMLElement => el !== null);
  if (els.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      const topMost = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (topMost) activeSection.value = topMost.target.id;
    },
    { rootMargin: '-40% 0px -45% 0px', threshold: 0 },
  );
  els.forEach((el) => observer?.observe(el));
}

// The sections live in a child route component (<RouterView> → Home). A single
// nextTick isn't enough to guarantee that child has mounted, so wait a frame.
function scheduleSpy(): void {
  nextTick(() => requestAnimationFrame(setupSpy));
}

onMounted(scheduleSpy);
watch(() => route.path, scheduleSpy);
onBeforeUnmount(teardownSpy);
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
      <div class="hidden items-center md:flex" aria-label="Page sections">
        <AnimatedTabs :items="sections" :active-id="activeSection" @select="scrollTo" />
      </div>

      <!-- Desktop: page links + theme toggle -->
      <div class="hidden items-center gap-1 md:flex">
        <AnimatedTabs :items="pageLinks" />

        <div class="ml-1 h-5 w-px bg-bone/15" aria-hidden="true"></div>

        <ThemeToggler />
      </div>

      <!-- Mobile: hamburger -->
      <div class="flex items-center gap-2 md:hidden">
        <ThemeToggler />

        <RippleButton
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
        </RippleButton>
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
          <RippleButton
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="block w-full rounded-md px-3 py-2 text-left text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="scrollTo(s.id)"
          >
            {{ s.label }}
          </RippleButton>

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
            to="/docs"
            active-class="text-accent bg-bone/5"
            class="block rounded-md px-3 py-2 text-sm text-bone/70 transition-colors hover:bg-bone/8 hover:text-bone"
            @click="mobileOpen = false"
          >
            Docs
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
