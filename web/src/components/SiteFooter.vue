<script setup lang="ts"></script>

<template>
  <footer class="border-t border-bone/10 px-6 py-12">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <div class="flex items-center gap-2.5">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
            <rect x="4" y="20" width="6" height="10" rx="1.5" fill="#fafaf7" opacity="0.35"/>
            <rect x="13" y="12" width="6" height="18" rx="1.5" fill="#fafaf7" opacity="0.6"/>
            <rect x="22" y="4" width="6" height="26" rx="1.5" fill="#ff3d00"/>
          </svg>
          <div class="font-display text-lg font-bold text-bone">tokenmaxxingman</div>
        </div>
        <p class="mt-1 text-sm text-bone/50">
          The empirical opposite of <a class="underline-offset-4 hover:underline" href="https://getcaveman.dev/">caveman</a>.
          MIT-licensed. Made for the joke.
        </p>
      </div>
      <nav aria-label="Footer" class="flex flex-wrap items-center gap-6 text-sm text-bone/60">
        <a
          href="https://github.com/KangaZero/tokenmaxxingman"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-bone"
        >
          GitHub <span class="sr-only">(opens in new tab)</span>
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman/releases"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-bone"
        >
          Releases <span class="sr-only">(opens in new tab)</span>
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman#install"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-bone"
        >
          Docs <span class="sr-only">(opens in new tab)</span>
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-bone"
        >
          Changelog <span class="sr-only">(opens in new tab)</span>
        </a>
      </nav>
    </div>
    <div class="mx-auto mt-8 max-w-6xl text-xs text-bone/30">
      The "10.4×" and similar claims are derived from a bundled 18-variant, 8-sentence benchmark.
      Reproduce with <code class="font-mono text-bone/50">tmm benchmark</code>. Caveats apply — see the
      <a class="underline" href="https://github.com/KangaZero/tokenmaxxingman#caveats">project README</a>.
      This footer contains 47 words. Under
      <code class="font-mono text-bone/40">/tokenmaxxingman verbose-ultra</code>, it would contain
      approximately 380. We chose not to do that here. We want to be clear that we could.
    </div>
  </footer>
</template>
