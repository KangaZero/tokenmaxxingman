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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(250, 250, 247, 0.9)',
        font: { family: 'Inter', size: 13 },
        padding: 16,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      borderColor: 'rgba(250, 250, 247, 0.2)',
      borderWidth: 1,
      titleFont: { family: 'Space Grotesk' },
      bodyFont: { family: 'JetBrains Mono' },
      padding: 12,
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(250, 250, 247, 0.75)', font: { family: 'Inter' } },
      grid: { display: false },
    },
    y: {
      ticks: { color: 'rgba(250, 250, 247, 0.6)', font: { family: 'JetBrains Mono' } },
      grid: { color: 'rgba(250, 250, 247, 0.08)' },
      title: {
        display: true,
        text: 'tokens / word',
        color: 'rgba(250, 250, 247, 0.7)',
        font: { family: 'Inter', weight: 500 },
      },
    },
  },
};
</script>

<template>
  <div class="card p-8" style="height: 480px">
    <Bar :data="chartData" :options="options" />
  </div>
  <p class="mt-4 text-sm text-bone/50">
    Most non-Latin scripts get cheaper under <code class="rounded bg-bone/10 px-1.5 py-0.5 font-mono text-xs">o200k_base</code>.
    Cherokee and Inuktitut barely move. Inuktitut <em class="italic">worsens</em>.
  </p>
</template>
