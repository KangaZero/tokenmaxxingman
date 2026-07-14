import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        bone: 'rgb(var(--color-bone) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          soft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
          dim: 'rgb(var(--color-accent-dim) / <alpha-value>)',
        },
        cool: {
          DEFAULT: 'rgb(var(--color-cool) / <alpha-value>)',
          deep: 'rgb(var(--color-cool-deep) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'count-up': 'count-up 1.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
