"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { CONTACT_SOCIAL_WHATSAPP } from "@/content/contact-page";

type ProjectDetailClientProps = {
  project: {
    title: string;
    category: string | null;
    description: string | null;
    status: string | null;
    year: number | null;
    location: string | null;
    areaM2: number | null;
    imageUrl: string;
    gallery: string[];
  };
};

const easeInOut = [0.42, 0, 0.58, 1] as const;

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  const gallery = useMemo(() => {
    return Array.from(new Set([project.imageUrl, ...project.gallery])).slice(0, 6);
  }, [project.gallery, project.imageUrl]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const activeSrc = selectedImageIndex == null ? null : gallery[selectedImageIndex];

  const canPrev = selectedImageIndex != null && selectedImageIndex > 0;
  const canNext = selectedImageIndex != null && selectedImageIndex < gallery.length - 1;

  const close = () => setSelectedImageIndex(null);
  const prev = () => setSelectedImageIndex((i) => (i == null ? i : Math.max(0, i - 1)));
  const next = () => setSelectedImageIndex((i) => (i == null ? i : Math.min(gallery.length - 1, i + 1)));

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchLocked = useRef<"x" | "y" | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchLocked.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    if (touchStartX.current == null || touchStartY.current == null) return;

    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    if (touchLocked.current == null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        touchLocked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
    }

    if (touchLocked.current === "x") {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (selectedImageIndex == null) return;
    const changed = e.changedTouches[0];
    if (!changed) return;
    if (touchStartX.current == null || touchStartY.current == null) return;

    const dx = changed.clientX - touchStartX.current;
    const dy = changed.clientY - touchStartY.current;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    // reset
    touchStartX.current = null;
    touchStartY.current = null;
    touchLocked.current = null;

    if (!isHorizontal) return;
    if (Math.abs(dx) < 48) return;

    if (dx < 0) next();
    else prev();
  };

  useEffect(() => {
    if (selectedImageIndex == null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex, gallery.length]);

  useEffect(() => {
    if (selectedImageIndex == null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedImageIndex]);

  return (
    <div className="w-full bg-white">
      {/* HERO */}
      <section className="relative h-[50vh] w-full overflow-hidden bg-border/30">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-black/10" />
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            {project.title}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* SOL */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-primary">
              {locale === "en" ? "About the Project" : "Proje Hakkında"}
            </h2>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-primary/70 sm:text-lg">
              {project.description || "—"}
            </p>

            <h3 className="mt-12 font-display text-xl font-semibold tracking-tight text-primary">
              {locale === "en" ? "Gallery" : "Galeri"}
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={cn(
                    "group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]",
                    "cursor-pointer text-left",
                    "transition-shadow duration-300 ease-out hover:shadow-[var(--shadow-card-hover)]",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={locale === "en" ? "Open image" : "Görseli büyüt"}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SAĞ */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-display text-base font-semibold uppercase tracking-[0.24em] text-primary/70">
                {locale === "en" ? "Project Information" : "Proje Bilgileri"}
              </h3>

              <dl className="mt-6 space-y-4 text-sm sm:text-base">
                {project.category ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{locale === "en" ? "Category" : "Kategori"}</dt>
                    <dd className="text-right font-medium text-primary">{project.category}</dd>
                  </div>
                ) : null}

                {project.status ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{locale === "en" ? "Status" : "Durum"}</dt>
                    <dd className="text-right font-medium text-primary">{project.status}</dd>
                  </div>
                ) : null}

                {project.year != null ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{locale === "en" ? "Year" : "Yıl"}</dt>
                    <dd className="text-right font-medium text-primary">{project.year}</dd>
                  </div>
                ) : null}

                {project.location ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{locale === "en" ? "Location" : "Konum"}</dt>
                    <dd className="text-right font-medium text-primary">{project.location}</dd>
                  </div>
                ) : null}

                {project.areaM2 != null ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">{locale === "en" ? "Area (m²)" : "Alan (m²)"}</dt>
                    <dd className="text-right font-medium text-primary">{project.areaM2}</dd>
                  </div>
                ) : null}

                {!project.category && !project.status && project.year == null && !project.location && project.areaM2 == null ? (
                  <p className="mt-6 text-sm text-muted">
                    {locale === "en"
                      ? "No additional info has been added for this project."
                      : "Bu proje için ek bilgi girilmemiş."}
                  </p>
                ) : null}
              </dl>

              <div className="mt-8 grid gap-3">
                <Link
                  href={CONTACT_SOCIAL_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {locale === "en" ? "WhatsApp" : "WhatsApp"}
                </Link>
                <Link
                  href={withLocalePath("/iletisim", locale)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-white px-5 py-3 font-display text-sm font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {locale === "en" ? "Get a Quote" : "Teklif Al / İletişim"}
                </Link>
                <Link
                  href={withLocalePath("/hizmetlerimiz", locale)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-transparent px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary/80 transition-colors hover:border-primary/25 hover:bg-primary/[0.03] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {locale === "en" ? "View Services" : "Hizmetlerimizi Gör"}
                </Link>
                <Link
                  href={withLocalePath("/projeler", locale)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-transparent px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary/80 transition-colors hover:border-primary/25 hover:bg-primary/[0.03] hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {locale === "en" ? "Back to Projects" : "Projeler Sayfasına Dön"}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImageIndex != null && activeSrc ? (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-[400] flex min-h-[100dvh] w-full items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={locale === "en" ? "Image viewer" : "Görsel görüntüleyici"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.3, ease: easeInOut }}
          >
            <button
              type="button"
              aria-label={locale === "en" ? "Close lightbox" : "Lightbox kapat"}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
              onClick={close}
            />

            {/* Close */}
            <button
              type="button"
              aria-label={locale === "en" ? "Close" : "Kapat"}
              onClick={close}
              className={cn(
                "touch-manipulation absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>

            {/* Prev / Next */}
            <button
              type="button"
              aria-label={locale === "en" ? "Previous image" : "Önceki görsel"}
              onClick={prev}
              disabled={!canPrev}
              className={cn(
                "touch-manipulation absolute left-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                !canPrev && "pointer-events-none opacity-0",
              )}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              aria-label={locale === "en" ? "Next image" : "Sonraki görsel"}
              onClick={next}
              disabled={!canNext}
              className={cn(
                "touch-manipulation absolute right-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full",
                "border border-white/15 bg-white/5 text-white/90 backdrop-blur-sm",
                "transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                !canNext && "pointer-events-none opacity-0",
              )}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
            </button>

            {/* Image stage */}
            <div className="relative z-10 mx-auto w-[min(1200px,92vw)]">
              <div
                className="relative h-[78vh] w-full touch-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeSrc}
                    className="absolute inset-0"
                    initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: easeInOut }}
                  >
                    <Image
                      src={activeSrc}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 92vw, 1200px"
                      className="object-contain object-center"
                      priority={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <p className="mt-4 text-center font-display text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                {selectedImageIndex + 1} / {gallery.length}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

