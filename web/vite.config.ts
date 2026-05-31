import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// GitHub Pages serves the site under /<repo-name>/, so set base accordingly.
// CI overrides via VITE_BASE env if needed (e.g. when deploying to a custom domain).
const base = process.env.VITE_BASE ?? '/tokenmaxxingman/';

export default defineConfig({
  base,
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2022',
  },
});
