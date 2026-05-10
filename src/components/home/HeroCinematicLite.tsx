"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { localeFromPathname } from "@/lib/locale";
import { HeroDreamBackdrop } from "@/components/home/HeroDreamBackdrop";

/**
 * Varsayılan kahraman görüntüsü: VP9 WebM (modern tarayıcıda genelde daha küçük) + H.264 MP4 (tam yedek).
 * `NEXT_PUBLIC_HOME_HERO_VIDEO_URL` doluysa tek CDN/URL kullanılır (çoğunlukla MP4).
 * `public/videos/kendi-hero.webm` eklediğinde üretimde çift kaynak için:
 * `NEXT_PUBLIC_HOME_HERO_WEBM=1` (WebM yokken 404 istememek için varsayılan kapalı).
 *
 * Yükleme sırasında: `<video poster>` — `public/videos/kendi-hero-poster.webp` veya
 * `NEXT_PUBLIC_HOME_HERO_POSTER_URL` (CDN).
 */
const HERO_VIDEO_STEM = "/videos/kendi-hero";
const HERO_VIDEO_OVERRIDE = process.env.NEXT_PUBLIC_HOME_HERO_VIDEO_URL?.trim();
const USE_WEBM_SOURCE = process.env.NEXT_PUBLIC_HOME_HERO_WEBM === "1";
const HERO_POSTER =
  process.env.NEXT_PUBLIC_HOME_HERO_POSTER_URL?.trim() || "/videos/kendi-hero-poster.webp";

function videoMimeFromUrl(url: string): string {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

export function HeroCinematicLite() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const isEn = locale === "en";
  const reduceMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  /** İlk sunucu + ilk istemci çizimi aynı olsun; reduceMotion sadece mount sonrası. */
  const motionOn = !hydrated || reduceMotion !== true;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => {});
  }, [pathname]);

  const ctaHrefProjects = isEn ? "/en/projeler" : "/projeler";
  const ctaHrefContact = isEn ? "/en/iletisim" : "/iletisim";

  const headline = isEn ? (
    <>
      Where{" "}
      <em className="not-italic text-white/[0.65]">dreams</em>
      {" "}
      rise <em className="not-italic text-white/[0.65]">through the silence.</em>
    </>
  ) : (
    <>
      <em className="not-italic text-white/[0.65]">Hayaller,</em> sessizlikte yükselir.
    </>
  );

  const sub =
    locale === "en"
      ? "Architecture, interior design, visualization, and turnkey execution — calm craft, precise detail."
      : "Mimari tasarım, iç mimarlık, görselleştirme ve anahtar teslim uygulama — sakin bir el, net bir detay.";

  const ctPrimary = isEn ? "View projects" : "Projeleri incele";
  const ctSecondary = isEn ? "Contact" : "İletişim";

  const scrollMain = () => {
    document.getElementById("home-content-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="home-hero"
      className={cn(
        "home-video-hero relative isolate w-full overflow-hidden text-white",
        motionOn && "home-video-hero--motion",
      )}
      aria-label={isEn ? "Homepage hero" : "Ana sayfa karşılama alanı"}
      style={{
        fontFamily: "var(--font-inter, var(--font-sans), sans-serif)",
        minHeight: "calc(100svh - var(--header-h))",
        backgroundColor: "hsl(201 100% 13%)",
      }}
    >
      <HeroDreamBackdrop motionOn={motionOn} />
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        poster={HERO_POSTER}
        suppressHydrationWarning
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        fetchPriority="high"
      >
        {HERO_VIDEO_OVERRIDE ? (
          <source src={HERO_VIDEO_OVERRIDE} type={videoMimeFromUrl(HERO_VIDEO_OVERRIDE)} />
        ) : (
          <>
            {USE_WEBM_SOURCE ? (
              <source src={`${HERO_VIDEO_STEM}.webm`} type="video/webm" />
            ) : null}
            <source src={`${HERO_VIDEO_STEM}.mp4`} type="video/mp4" />
          </>
        )}
      </video>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-[hsl(201_95%_8%/0.45)] via-transparent to-[hsl(210_85%_6%/0.55)] mix-blend-multiply"
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-[3] opacity-[0.38]",
          motionOn && "hero-dream-sheen-anim",
        )}
      />

      <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-[110rem] flex-1 flex-col items-center justify-center px-6 py-[90px] text-center md:pb-36 md:pt-28 lg:pb-40 lg:pt-32">
        <h1
          className={cn(
            "max-w-[80rem] text-balance font-normal text-5xl leading-[0.95] tracking-[-0.154rem] sm:text-7xl md:text-8xl",
            motionOn && "animate-fade-rise-video",
          )}
          style={{
            fontFamily: "'Instrument Serif', var(--font-display), serif",
          }}
        >
          {headline}
        </h1>

        <p
          className={cn(
            "mt-8 max-w-2xl text-base leading-relaxed text-white/[0.65] sm:text-lg",
            motionOn && "animate-fade-rise-video-delay",
          )}
        >
          {sub}
        </p>

        <div
          className={cn(
            "mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center",
            motionOn && "animate-fade-rise-video-delay-2",
          )}
        >
          <Link
            href={ctaHrefProjects}
            className="liquid-glass inline-flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full px-10 py-[1.125rem] text-base text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-14 sm:py-5"
          >
            {ctPrimary}
          </Link>
          <Link
            href={ctaHrefContact}
            className="liquid-glass inline-flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-0 px-10 py-[1.125rem] text-base text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-14 sm:py-5"
          >
            {ctSecondary}
          </Link>
        </div>

        <button
          type="button"
          onClick={scrollMain}
          className="mt-14 text-[0.65rem] font-medium uppercase tracking-[0.38em] text-white/40 transition hover:text-white/60 focus-visible:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30 sm:mt-16"
        >
          {isEn ? "Scroll" : "Kaydır"}
        </button>
      </div>
    </section>
  );
}
