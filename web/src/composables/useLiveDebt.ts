import { ref, onMounted, onUnmounted } from 'vue';

const START_DATE = new Date('2024-01-01').getTime();
const END_DATE = new Date('2099-01-01').getTime();
const START_VALUE = -2.4e9;
const END_VALUE   = -2.03493e30;

export function useLiveDebt() {
  const value = ref(START_VALUE);
  let interval: ReturnType<typeof setInterval> | null = null;

  function tick() {
    const now = Date.now();
    const progress = Math.min(1, (now - START_DATE) / (END_DATE - START_DATE));
    const curved = Math.pow(progress, 0.4);
    const base = START_VALUE + (END_VALUE - START_VALUE) * curved;
    const magnitude = Math.abs(base) * 0.00015;
    const noise = (Math.random() - 0.3) * magnitude;
    value.value = base + noise;
  }

  onMounted(() => {
    tick();
    interval = setInterval(tick, 80);
  });
  onUnmounted(() => { if (interval) clearInterval(interval); });

  return { value };
}
