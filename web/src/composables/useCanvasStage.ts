import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef, type Ref } from 'vue';

/**
 * Theme colours the vendored Canvas UI 3D components consume, as `#rrggbb`
 * strings. Canvas UI takes CSS colour strings rather than reading custom
 * properties itself, so the values are resolved from `style.css`'s theme
 * tokens here and re-resolved whenever the `light` class on `<html>` flips.
 */
export interface CanvasThemeTokens {
  ink: string;
  bone: string;
  accent: string;
  accentSoft: string;
  cool: string;
}

/** Fallbacks matching the dark-theme values in `style.css`. */
const TOKEN_FALLBACKS: Readonly<Record<keyof CanvasThemeTokens, string>> = {
  ink: '#0a0a0a',
  bone: '#fafaf7',
  accent: '#ff3d00',
  accentSoft: '#ff7849',
  cool: '#0ea5e9',
};

const TOKEN_PROPERTIES: Readonly<Record<keyof CanvasThemeTokens, string>> = {
  ink: '--color-ink',
  bone: '--color-bone',
  accent: '--color-accent',
  accentSoft: '--color-accent-soft',
  cool: '--color-cool',
};

const clampByte = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

/** `"250 250 247"` (the theme token format) to `"#fafaf7"`. */
function tripletToHex(triplet: string, fallback: string): string {
  const channels = triplet.trim().split(/\s+/).map(Number);
  if (channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) {
    return fallback;
  }
  return `#${channels.map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('')}`;
}

function readThemeTokens(): CanvasThemeTokens {
  const styles = getComputedStyle(document.documentElement);
  const read = (key: keyof CanvasThemeTokens): string =>
    tripletToHex(styles.getPropertyValue(TOKEN_PROPERTIES[key]), TOKEN_FALLBACKS[key]);

  return {
    ink: read('ink'),
    bone: read('bone'),
    accent: read('accent'),
    accentSoft: read('accentSoft'),
    cool: read('cool'),
  };
}

/**
 * three.js r150+ is WebGL2-only, so a WebGL1-only browser — or one whose GPU
 * driver is on the blocklist, or a headless/software-rendering environment that
 * refuses the context — cannot run these components at all. `getContext` returns
 * `null` rather than throwing in most of those cases, but a hardened browser can
 * throw outright, so both paths are handled.
 *
 * Probed once and memoised. The probe canvas is discarded and its single context
 * left to garbage collection: `getExtension('WEBGL_lose_context')` is typed
 * `any` by the DOM lib, and one throwaway context is nowhere near the
 * per-document context limit, so narrowing that return value would cost more
 * than it buys.
 */
let webgl2Probe: boolean | null = null;

export function supportsWebGl2(): boolean {
  if (webgl2Probe !== null) return webgl2Probe;
  if (typeof document === 'undefined') {
    webgl2Probe = false;
    return webgl2Probe;
  }
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    webgl2Probe = context !== null && !context.isContextLost();
  } catch {
    webgl2Probe = false;
  }
  return webgl2Probe;
}

/**
 * The site's favicon motif — three ascending bars, the tallest in accent red —
 * as a standalone SVG document coloured from the live theme.
 *
 * Canvas UI's 3D components sniff the asset bytes, trace the alpha silhouette
 * and extrude it, so this arrives as real geometry without committing a binary
 * model. Two consequences drive the markup: fills must be fully opaque (the
 * silhouette tracer discards partially transparent pixels, so the favicon's
 * `opacity` attributes become distinct theme colours instead), and `width` /
 * `height` must be explicit (an SVG sized only by `viewBox` has no intrinsic
 * size, and `HTMLImageElement.naturalWidth` would rasterise it at the UA
 * default rather than at full resolution).
 */
export function tokenBarsSvg(tokens: CanvasThemeTokens): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 32 32">',
    `<rect x="4" y="20" width="6" height="10" rx="1.5" fill="${tokens.bone}"/>`,
    `<rect x="13" y="12" width="6" height="18" rx="1.5" fill="${tokens.cool}"/>`,
    `<rect x="22" y="4" width="6" height="26" rx="1.5" fill="${tokens.accent}"/>`,
    '</svg>',
  ].join('');
}

/**
 * Encode as a `data:` URL. Canvas UI loads assets with `fetch()`, which accepts
 * `data:` URLs, so nothing is requested over the network and the site keeps
 * rendering offline. `btoa` is safe here because `tokenBarsSvg` emits ASCII only.
 */
function toSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export interface CanvasStage {
  /** Attach to the sized, positioned element that gates mounting on visibility. */
  root: Ref<HTMLElement | null>;
  /** True only when a 3D component may mount. Render static markup otherwise. */
  active: ComputedRef<boolean>;
  /** Live theme colours for the component's colour props. */
  theme: Ref<CanvasThemeTokens>;
  /** `data:` URL for the component's `src`, recoloured with the theme. */
  glyphSrc: ComputedRef<string>;
  /** Wire to the component's `onError`; disables the stage for good. */
  reportError: (error: unknown) => void;
}

/**
 * Capability, motion and visibility gate for a vendored Canvas UI 3D component.
 *
 * `active` is false — so the caller renders its static fallback and the three.js
 * chunk is never even requested — when any of these hold:
 *
 * - WebGL2 is unavailable, or the renderer failed to build a context;
 * - the user prefers reduced motion (these effects float, rock and orbit
 *   continuously, so the honest fallback is the flat motif, not a frozen frame);
 * - the element is nowhere near the viewport;
 * - the asset failed to decode.
 */
export function useCanvasStage(): CanvasStage {
  const root = ref<HTMLElement | null>(null);
  const theme = ref<CanvasThemeTokens>({ ...TOKEN_FALLBACKS });
  const visible = ref(false);
  const failed = ref(false);
  const allowsMotion = ref(false);
  const hasWebGl2 = ref(false);

  const glyphSrc = computed<string>(() => toSvgDataUrl(tokenBarsSvg(theme.value)));
  const active = computed<boolean>(
    () => hasWebGl2.value && allowsMotion.value && visible.value && !failed.value,
  );

  let motionQuery: MediaQueryList | null = null;
  let themeObserver: MutationObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;

  const syncTheme = (): void => {
    theme.value = readThemeTokens();
  };
  const syncMotion = (): void => {
    allowsMotion.value = motionQuery !== null && !motionQuery.matches;
  };

  onMounted(() => {
    hasWebGl2.value = supportsWebGl2();
    syncTheme();

    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', syncMotion);
    syncMotion();

    themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Mount slightly before the stage scrolls in so the chunk and the studio
    // environment are ready by the time it is actually on screen.
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible.value = entries[entries.length - 1]?.isIntersecting ?? false;
      },
      { rootMargin: '256px' },
    );
    if (root.value) intersectionObserver.observe(root.value);
  });

  onBeforeUnmount(() => {
    motionQuery?.removeEventListener('change', syncMotion);
    motionQuery = null;
    themeObserver?.disconnect();
    themeObserver = null;
    intersectionObserver?.disconnect();
    intersectionObserver = null;
  });

  return {
    root,
    active,
    theme,
    glyphSrc,
    reportError: (error: unknown): void => {
      failed.value = true;
      if (import.meta.env.DEV) console.warn('[CanvasStage] falling back to static markup:', error);
    },
  };
}
