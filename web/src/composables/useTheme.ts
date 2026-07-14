import { ref, onMounted } from 'vue';

/** Minimal typing for the View Transitions API (not yet in every TS DOM lib). */
interface ViewTransition {
  readonly ready: Promise<void>;
}
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

const isDark = ref(true);

function applyTheme(dark: boolean): void {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
  }
  try {
    localStorage.setItem('tmm_theme', dark ? 'dark' : 'light');
  } catch {
    /* private mode / quota exceeded — preference simply won't persist */
  }
}

/**
 * Toggle the theme with an expanding-circle reveal originating from the click
 * point. Falls back to an instant swap when the View Transitions API is
 * unavailable or the user prefers reduced motion.
 */
function toggleTheme(event?: MouseEvent): void {
  const doc = document as DocumentWithViewTransition;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc.startViewTransition || prefersReduced) {
    applyTheme(!isDark.value);
    return;
  }

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = doc.startViewTransition(() => {
    applyTheme(!isDark.value);
  });

  void transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
}

let initialized = false;

function initTheme(): void {
  // Guarded so it runs once, no matter how many components call useTheme().
  if (initialized) return;
  initialized = true;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('tmm_theme');
  } catch {
    /* storage unavailable — fall back to system preference */
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
}

export function useTheme() {
  onMounted(initTheme);

  return { isDark, toggleTheme };
}
