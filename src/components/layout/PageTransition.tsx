"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { easePremium } from "@/lib/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        // Keep SSR content visible even if hydration/animation fails.
        initial={false}
        animate={reduceMotion || !mounted ? undefined : { opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={reduceMotion ? undefined : { duration: 0.22, ease: easePremium }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

