"use client";

import { useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ABOUT_HERO_VIDEO_MP4,
  ABOUT_HERO_VIDEO_POSTER,
} from "@/content/about-media";
import { cn } from "@/lib/cn";

type AboutHeroLoopVideoProps = {
  className?: string;
};

/**
 * Sessiz, sonsuz döngü — tarayıcıların GIF benzeri davranışı (muted + playsInline + loop).
 * Görünür alanda oynatır; görünürlük dışında duraklatır (pil / performans).
 */
export function AboutHeroLoopVideo({ className }: AboutHeroLoopVideoProps) {
  /** SSR ile ilk istemci çiziminde aynı dal; ayrıca video üzerinde eklenti kaynaklı class farkları için suppressHydrationWarning. */
  const reduceMotion = useReducedMotion() === true;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { amount: 0.2, margin: "0px 0px -10% 0px" });
  const [hasVideoError, setHasVideoError] = useState(false);
  const showVideo = !reduceMotion && !hasVideoError;

  const posterAlt = useMemo(
    () => "Hakkımızda sayfası görseli",
    [],
  );

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
        /* Autoplay politikası — kullanıcı etkileşimi sonrası tekrar dener */
      });
    };

    play();
    el.addEventListener("canplay", play);
    return () => {
      el.removeEventListener("canplay", play);
    };
  }, [isInView, reduceMotion]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0", className)}>
      {showVideo ? (
        <video
          ref={videoRef}
          suppressHydrationWarning
          className="h-full w-full scale-[1.02] object-cover object-center"
          aria-label="Mimari çizim ve render döngü videosu"
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          poster={ABOUT_HERO_VIDEO_POSTER}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onError={() => setHasVideoError(true)}
        >
          <source src={ABOUT_HERO_VIDEO_MP4} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={ABOUT_HERO_VIDEO_POSTER}
          alt={posterAlt}
          fill
          priority={false}
          className="h-full w-full scale-[1.02] object-cover object-center"
          sizes="100vw"
        />
      )}
    </div>
  );
}
