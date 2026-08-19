/**
 * Vendored from Canvas UI - https://canvasui.dev
 * Source    : https://raw.githubusercontent.com/DavidHDev/canvas-ui/main/src/lib/rect-cache.ts
 * Author    : David Haz (https://github.com/DavidHDev/canvas-ui)
 * License   : MIT + Commons Clause License Condition v1.0 - see ./LICENSE-canvasui
 * Vendored  : 2026-08-19
 *
 * Why this file exists: `particle-object-vue` imports `createRectCache` but the
 * shadcn registry payload ships neither the file nor a `registryDependencies`
 * entry for it, so `curl`-based vendoring alone yields an unresolvable import.
 * Taken verbatim from the upstream repository; only this header was added.
 */

export function createRectCache(element: Element) {
  let current = element.getBoundingClientRect();

  const refresh = () => {
    current = element.getBoundingClientRect();
  };

  const observer = new ResizeObserver(refresh);
  observer.observe(element);
  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("scroll", refresh, {
    capture: true,
    passive: true,
  });

  return {
    get current() {
      return current;
    },
    destroy() {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    },
  };
}
