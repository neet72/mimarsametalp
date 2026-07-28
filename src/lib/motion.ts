import type { Transition, Variants } from "framer-motion";

export const easePremium = [0.22, 1, 0.36, 1] as const;

export const springSoft = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

/** Shared once-only scroll viewport — transform/opacity reveals only. */
export const viewportOnce = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -8% 0px",
} as const;

export function staggerDelay(index: number, step = 0.06, cap = 0.42): number {
  return Math.min(index * step, cap);
}

export function stagger(opts?: { stagger?: number; delay?: number }): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: opts?.stagger ?? 0.08,
        delayChildren: opts?.delay ?? 0.04,
      },
    },
  };
}

/** Section / child stagger using show key (detail pages, grids). */
export const sectionStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: easePremium },
  },
};

/** Alias — blur-free fade (opacity only). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: easePremium },
  },
};

/**
 * Legacy name kept for imports — now blur-free (opacity + y only).
 * Prefer `fadeUp` for new code.
 */
export const fadeUpSoft: Variants = fadeUp;

/** Listing page header: kicker → title → copy → count. */
export const headerReveal: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const headerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easePremium },
  },
};

/** Grid cards — hidden/show keys match whileInView pattern. */
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easePremium },
  },
};

/** Detail / section children using show key. */
export const fadeUpShow: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easePremium },
  },
};

export const fadeInX = (direction: -1 | 1, distance = 44): Variants => ({
  hidden: { opacity: 0, x: direction * distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: easePremium },
  },
});

export const revealTransition = (delay = 0): Transition => ({
  duration: 0.62,
  delay,
  ease: easePremium,
});
