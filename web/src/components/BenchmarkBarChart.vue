<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { CL100K_ROWS } from '../data/benchmark';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const visible = computed(() => CL100K_ROWS.slice(0, 16));

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: visible.value.map((r) => `${r.name} (${r.code})`),
  datasets: [
    {
      label: 'tokens / character',
      data: visible.value.map((r) => r.tokensPerCharacter),
      backgroundColor: visible.value.map((r) => {
        if (r.code === 'iu-cans') return '#ff3d00';
        if (r.code === 'zh-classical') return '#0ea5e9';
        if (r.code === 'en') return '#fafaf7';
        return r.tokensPerCharacter > 1 ? 'rgba(255, 120, 73, 0.5)' : 'rgba(250, 250, 247, 0.3)';
      }),
      borderColor: visible.value.map((r) => {
        if (r.code === 'iu-cans') return '#ff3d00';
        if (r.code === 'zh-classical') return '#0ea5e9';
        return 'transparent';
      }),
      borderWidth: 2,
      borderRadius: 4,
    },
  ],
}));

const options: ChartOptions<'bar'> = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
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
      ticks: { color: 'rgba(250, 250, 247, 0.6)', font: { family: 'JetBrains Mono' } },
      grid: { color: 'rgba(250, 250, 247, 0.08)' },
      title: {
        display: true,
        text: 'tokens / character (cl100k_base)',
        color: 'rgba(250, 250, 247, 0.7)',
        font: { family: 'Inter', weight: 500 },
      },
    },
    y: {
      ticks: { color: 'rgba(250, 250, 247, 0.75)', font: { family: 'Inter' } },
      grid: { display: false },
    },
  },
};
</script>

<template>
  <div class="card p-8" style="height: 600px">
    <Bar :data="chartData" :options="options" />
  </div>
  <p class="mt-4 text-sm text-bone/50">
    Highlighted: <span class="text-accent font-medium">Inuktitut (rank 1)</span>,
    <span class="text-cool font-medium">Classical Chinese (rank 11)</span>,
    <span class="text-bone font-medium">English (rank 16)</span>.
  </p>
</template>
