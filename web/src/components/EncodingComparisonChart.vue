<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { CL100K_ROWS, O200K_ROWS } from '../data/benchmark';
import { useTheme } from '../composables/useTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const { isDark } = useTheme();

const COMPARE_CODES = ['iu-cans', 'chr', 'am', 'bo', 'my', 'zh-classical', 'en'] as const;

const rows = computed(() => {
  return COMPARE_CODES.map((code) => {
    const cl = CL100K_ROWS.find((r) => r.code === code)!;
    const o = O200K_ROWS.find((r) => r.code === code)!;
    return { code, name: cl.name, cl: cl.tokensPerWord, o: o.tokensPerWord };
  });
});

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: rows.value.map((r) => r.name),
  datasets: [
    {
      label: 'cl100k_base',
      data: rows.value.map((r) => r.cl),
      backgroundColor: 'rgba(255, 61, 0, 0.7)',
      borderColor: '#ff3d00',
      borderWidth: 2,
      borderRadius: 4,
    },
    {
      label: 'o200k_base',
      data: rows.value.map((r) => r.o),
      backgroundColor: 'rgba(14, 165, 233, 0.7)',
      borderColor: '#0ea5e9',
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
}));

const options = computed<ChartOptions<'bar'>>(() => {
  const bone = isDark.value ? '250, 250, 247' : '18, 18, 15';
  const ink = isDark.value ? '10, 10, 10' : '248, 248, 245';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: `rgba(${bone}, 0.9)`,
          font: { family: 'Inter', size: 13 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: `rgba(${ink}, 0.95)`,
        borderColor: `rgba(${bone}, 0.2)`,
        borderWidth: 1,
        titleFont: { family: 'Space Grotesk' },
        bodyFont: { family: 'JetBrains Mono' },
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: `rgba(${bone}, 0.75)`, font: { family: 'Inter' } },
        grid: { display: false },
      },
      y: {
        ticks: { color: `rgba(${bone}, 0.6)`, font: { family: 'JetBrains Mono' } },
        grid: { color: `rgba(${bone}, 0.08)` },
        title: {
          display: true,
          text: 'tokens / word',
          color: `rgba(${bone}, 0.7)`,
          font: { family: 'Inter', weight: 500 },
        },
      },
    },
  };
});
</script>

<template>
  <div
    role="img"
    aria-label="Grouped bar chart comparing cl100k_base vs o200k_base tok/word for 7 languages. Most scripts improve under o200k_base. Inuktitut is the only language that worsens: 21.05 → 21.55 tok/word."
    class="card p-8"
    style="height: 480px"
  >
    <Bar :data="chartData" :options="options" />
  </div>
  <p class="mt-4 text-sm text-bone/50">
    Most non-Latin scripts get cheaper under <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-xs">o200k_base</code>.
    Cherokee and Inuktitut barely move. Inuktitut <em class="italic">worsens</em>.
  </p>
</template>
