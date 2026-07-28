"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { easePremium, revealTransition, viewportOnce } from "@/lib/motion";

export type FadeInProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  delay?: number;
  y?: number;
};

/**
 * Scroll-triggered fade-up — once only, opacity + transform.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 20,
  ...rest
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={
        reduceMotion ? { duration: 0.01, delay: 0 } : revealTransition(delay)
      }
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export type RevealProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  /** Mount animation instead of scroll (headers above the fold). */
  onMount?: boolean;
};

/**
 * Lightweight reveal for section headers / CTA bands.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  onMount = false,
  ...rest
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (onMount) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.55, delay, ease: easePremium }
        }
        className={cn(className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={
        reduceMotion ? { duration: 0.01 } : { duration: 0.55, delay, ease: easePremium }
      }
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
