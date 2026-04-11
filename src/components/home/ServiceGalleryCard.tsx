"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ServiceGalleryItem } from "@/content/services-gallery";

type ServiceGalleryCardProps = {
  service: ServiceGalleryItem;
  index: number;
};

export function ServiceGalleryCard({ service, index }: ServiceGalleryCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-border/25 shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]">
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 3}
          className={cn(
            "object-cover object-center transition-transform duration-700 ease-out will-change-transform",
            "group-hover:scale-110 motion-reduce:group-hover:scale-100",
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
          <h3
            className={cn(
              "text-center font-display text-[10px] font-semibold uppercase leading-snug tracking-[0.2em] text-white drop-shadow-sm sm:text-[11px] sm:tracking-[0.22em] md:text-xs md:tracking-[0.24em]",
              "transition-transform duration-500 ease-out motion-reduce:transition-none",
              "group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0",
            )}
          >
            {service.title}
          </h3>
        </div>
      </div>
    </article>
  );
}
