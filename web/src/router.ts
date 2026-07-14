import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import About from './pages/About.vue';
import Settings from './pages/Settings.vue';
import Contributors from './pages/Contributors.vue';
import Investors from './pages/Investors.vue';
import Testimonials from './pages/Testimonials.vue';
import Docs from './pages/Docs.vue';

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/contributors', component: Contributors },
    { path: '/settings', component: Settings },
    { path: '/investors', component: Investors },
    { path: '/testimonials', component: Testimonials },
    { path: '/docs', component: Docs },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0, behavior: 'smooth' };
  },
});
