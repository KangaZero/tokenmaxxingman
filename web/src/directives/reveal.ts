import type { Directive } from 'vue';

export type RevealVariant = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right';

export const vReveal: Directive<HTMLElement, RevealVariant | undefined> = {
  mounted(el, binding) {
    const variant: RevealVariant = binding.value ?? 'fade-up';
    el.classList.add('reveal', `reveal-${variant}`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
  },
};
