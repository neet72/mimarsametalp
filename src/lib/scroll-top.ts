import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function setActiveLenis(instance: Lenis | null) {
  activeLenis = instance;
}

export function getActiveLenis() {
  return activeLenis;
}

/** Route change: Lenis + native scroll’u anında tepeye al (smooth CSS’i bypass). */
export function scrollToTopImmediate() {
  if (typeof window === "undefined") return;

  try {
    activeLenis?.scrollTo(0, { immediate: true });
  } catch {
    // ignore
  }

  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  } catch {
    window.scrollTo(0, 0);
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
