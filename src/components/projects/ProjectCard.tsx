"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="group relative w-full"
      initial={false}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, transition: spring }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={spring}
    >
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-border/30",
          "shadow-[var(--shadow-card)] transition-shadow duration-500 ease-out",
          "group-hover:shadow-[var(--shadow-card-hover)]",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 origin-center transition-transform duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
            "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
          )}
        >
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
            className={cn(
              "object-cover object-center transition-[filter] duration-700 ease-out",
              "group-hover:brightness-[1.03] motion-reduce:group-hover:brightness-100",
            )}
          />
        </div>

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
            "bg-gradient-to-t from-primary/55 via-primary/10 to-transparent",
            "group-hover:opacity-100 motion-reduce:group-hover:opacity-0",
          )}
        />

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-accent",
            "transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:scale-x-100 motion-reduce:group-hover:scale-x-0",
          )}
        />
      </div>

      <div className="mt-5 text-center sm:text-left">
        <h2 className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-muted transition-colors duration-300 group-hover:text-primary sm:text-[0.8125rem] sm:tracking-[0.26em] md:text-sm md:tracking-[0.28em]">
          {project.title}
        </h2>
      </div>
    </motion.article>
  );
}
