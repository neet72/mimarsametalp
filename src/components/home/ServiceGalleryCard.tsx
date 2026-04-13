"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { ServiceGalleryItem } from "@/content/services-gallery";
import { localeFromPathname, withLocalePath } from "@/lib/locale";

type ServiceGalleryCardProps = {
  service: ServiceGalleryItem;
  index: number;
};

export function ServiceGalleryCard({ service, index }: ServiceGalleryCardProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  return (
    <Link
      href={withLocalePath(`/hizmetlerimiz/${service.slug}`, locale)}
      className="group block w-full min-w-0 max-w-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      aria-label={
        locale === "en"
          ? `Go to ${service.title} details`
          : `${service.title} detayına git`
      }
    >
      <article
        className={cn(
          "relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-border/25",
          "shadow-[var(--shadow-card)] ring-1 ring-inset ring-primary/[0.06]",
          "transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-card-hover)]",
          "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0",
        )}
      >
        <div className="relative aspect-video w-full min-w-0 overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
            className={cn(
              "object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              "group-hover:scale-[1.12] motion-reduce:group-hover:scale-100",
            )}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:group-hover:opacity-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.16),transparent_55%)] mix-blend-overlay" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-7">
            <h3
              className={cn(
                "text-center font-display text-[11px] font-semibold uppercase leading-relaxed text-white drop-shadow-sm",
                "break-normal text-pretty tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em] md:text-xs md:tracking-[0.22em] lg:tracking-[0.24em]",
                "transition-transform duration-500 ease-out motion-reduce:transition-none",
                "group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0",
              )}
            >
              {service.title}
            </h3>
          </div>
        </div>
      </article>
    </Link>
  );
}
