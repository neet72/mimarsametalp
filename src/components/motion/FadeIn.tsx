"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

export type FadeInProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  delay?: number;
  y?: number;
};

/**
 * Görünür alana girince yumuşak fade-in + yukarı kayma (scroll tetikli, bir kez).
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 22,
  ...rest
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -8% 0px" }}
      transition={
        reduceMotion ? { duration: 0.01, delay: 0 } : { duration: 0.62, delay, ease }
      }
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
