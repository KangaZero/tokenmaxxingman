import { ref, onMounted } from 'vue';

const isDark = ref(true);

function applyTheme(dark: boolean): void {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
  }
  localStorage.setItem('tmm_theme', dark ? 'dark' : 'light');
}

function toggleTheme(): void {
  applyTheme(!isDark.value);
}

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem('tmm_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved === 'dark' : prefersDark);
  });

  return { isDark, toggleTheme };
}
