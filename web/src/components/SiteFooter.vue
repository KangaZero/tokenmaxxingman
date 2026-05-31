<script setup lang="ts"></script>

<template>
  <footer class="border-t border-bone/10 px-6 py-12">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <div class="font-display text-lg font-bold text-bone">tokenmaxxingman</div>
        <p class="mt-1 text-sm text-bone/50">
          The empirical opposite of <a class="underline-offset-4 hover:underline" href="https://getcaveman.dev/">caveman</a>.
          MIT-licensed. Made for the joke.
        </p>
      </div>
      <nav class="flex flex-wrap items-center gap-6 text-sm text-bone/60">
        <a
          href="https://github.com/KangaZero/tokenmaxxingman"
          target="_blank"
          rel="noopener"
          class="hover:text-bone"
        >
          GitHub
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman/releases"
          target="_blank"
          rel="noopener"
          class="hover:text-bone"
        >
          Releases
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman#install"
          target="_blank"
          rel="noopener"
          class="hover:text-bone"
        >
          Docs
        </a>
        <a
          href="https://github.com/KangaZero/tokenmaxxingman/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener"
          class="hover:text-bone"
        >
          Changelog
        </a>
      </nav>
    </div>
    <div class="mx-auto mt-8 max-w-6xl text-xs text-bone/30">
      The "10.4×" and similar claims are derived from a bundled 18-variant, 8-sentence benchmark.
      Reproduce with <code class="font-mono text-bone/50">tmm benchmark</code>. Caveats apply — see the
      <a class="underline" href="https://github.com/KangaZero/tokenmaxxingman#caveats">project README</a>.
    </div>
  </footer>
</template>
