"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { localeFromPathname, withLocalePath } from "@/lib/locale";

const spring = { type: "spring" as const, stiffness: 380, damping: 28 };

export type ProjectCardModel = {
  slug: string;
  title: string;
  imageUrl: string;
};

type ProjectCardProps = {
  project: ProjectCardModel;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // Desktop-only effect (CSS guarded). Keep very subtle.
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 6; // degrees
    const rx = (0.5 - py) * 5; // degrees
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
  }, []);

  const onLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glow-x", "50%");
    el.style.setProperty("--glow-y", "30%");
  }, []);

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
      <Link
        href={withLocalePath(`/projeler/${project.slug}`, locale)}
        className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-lg"
        aria-label={
          locale === "en"
            ? `Go to ${project.title} details`
            : `${project.title} detay sayfasına git`
        }
      >
        <div
          className={cn(
            "tilt-card relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-border/30",
            "shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]",
            "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:shadow-[var(--shadow-card-hover)]",
            "motion-reduce:transition-none",
          )}
          onMouseMove={reduceMotion ? undefined : onMove}
          onMouseLeave={reduceMotion ? undefined : onLeave}
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
              priority={index === 0}
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
      </Link>
    </motion.article>
  );
}
