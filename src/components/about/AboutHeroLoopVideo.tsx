"use client";

import { useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ABOUT_HERO_VIDEO_MP4 } from "@/content/about-media";
import { cn } from "@/lib/cn";

type AboutHeroLoopVideoProps = {
  className?: string;
  /** MP4 tam URL veya site içi yol */
  videoSrc?: string | null;
  /** Video hazır olana kadar; mimar portresiyle aynı dosyayı kullanmayın */
  posterSrc?: string | null;
};

/**
 * Sessiz, sonsuz döngü — tarayıcıların GIF benzeri davranışı (muted + playsInline + loop).
 * Görünür alanda oynatır; görünürlük dışında duraklatır (pil / performans).
 */
export function AboutHeroLoopVideo({ className, videoSrc, posterSrc }: AboutHeroLoopVideoProps) {
  const reduceMotion = useReducedMotion() === true;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { amount: 0.2, margin: "0px 0px -10% 0px" });
  const [hasVideoError, setHasVideoError] = useState(false);
  const showVideo = !reduceMotion && !hasVideoError;

  const mp4 = (videoSrc?.trim() || ABOUT_HERO_VIDEO_MP4).trim();
  const poster = (posterSrc?.trim() || "").trim();

  const posterAlt = useMemo(() => "Hakkımızda üst alan kapak görseli", []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!showVideo) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      return;
    }

    if (!isInView) {
      el.pause();
      return;
    }

    const play = () => {
      void el.play().catch(() => {
        /* Autoplay politikası */
      });
    };

    play();
    el.addEventListener("canplay", play);
    return () => {
      el.removeEventListener("canplay", play);
    };
  }, [isInView, showVideo]);

  const showPosterImage = poster.length > 0;

  return (
    <div ref={containerRef} className={cn("absolute inset-0", className)}>
      {showVideo ? (
        <>
          {!showPosterImage ? (
            <div
              aria-hidden
              className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-800/90 via-zinc-900 to-zinc-950"
            />
          ) : null}
          <video
            ref={videoRef}
            suppressHydrationWarning
            className="relative z-[1] h-full w-full scale-[1.02] object-cover object-center"
            aria-label="Hakkımızda üst alan videosu"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            poster={showPosterImage ? poster : undefined}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onError={() => setHasVideoError(true)}
          >
            <source src={mp4} type="video/mp4" />
          </video>
        </>
      ) : showPosterImage ? (
        <Image
          src={poster}
          alt={posterAlt}
          fill
          priority
          className="h-full w-full scale-[1.02] object-cover object-center"
          sizes="100vw"
          unoptimized={poster.startsWith("http") || poster.startsWith("//")}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-zinc-800/90 via-zinc-900 to-zinc-950"
        />
      )}
    </div>
  );
}
