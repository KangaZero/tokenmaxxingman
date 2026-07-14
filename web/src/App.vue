<script setup lang="ts">
import { RouterView } from 'vue-router';
import AnnouncementBanner from './components/AnnouncementBanner.vue';
import SiteNav from './components/SiteNav.vue';
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-medium focus:text-ink focus:shadow-lg"
  >
    Skip to main content
  </a>
  <SiteNav />
  <div class="mt-14">
    <AnnouncementBanner />
  </div>
  <RouterView />
</template>
