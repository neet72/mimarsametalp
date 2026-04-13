import type { Variants } from "framer-motion";

export const easePremium = [0.22, 1, 0.36, 1] as const;

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

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: easePremium } },
};

export function fadeInX(direction: -1 | 1, distance = 44): Variants {
  return {
    hidden: { opacity: 0, x: direction * distance },
    visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: easePremium } },
  };
}

