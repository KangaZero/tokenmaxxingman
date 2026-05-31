import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        bone: '#fafaf7',
        accent: {
          DEFAULT: '#ff3d00',
          soft: '#ff7849',
          dim: '#cc3000',
        },
        cool: {
          DEFAULT: '#0ea5e9',
          deep: '#0369a1',
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
