"use client";

import { cn } from "@/lib/cn";

/** “Hayaller, sessizlikte yükselir — sakin el, net detay”: katmanlı ışık, ufuk strataları, ince dokular — tamamen CSS, çok düşük tempo. */
export function HeroDreamBackdrop({ motionOn }: { motionOn: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "hero-dream-backdrop pointer-events-none absolute inset-0 z-0 overflow-hidden",
        motionOn && "hero-dream-backdrop--motion",
      )}
    >
      {/* Derin baz ışığı + yüzey sıcaklığı (hareketsiz gövde) */}
      <div className="hero-dream-luminosity absolute inset-0" />
      {/* Çok uzak — yumuşak ışınım */}
      <div
        className={cn("hero-dream-ray-fan absolute inset-[-35%]", motionOn && "hero-dream-anim-rays")}
      />
      <div
        className={cn(
          "hero-dream-orb hero-dream-orb-a absolute rounded-full blur-[100px]",
          motionOn && "hero-dream-anim-a",
        )}
      />
      <div
        className={cn(
          "hero-dream-orb hero-dream-orb-b absolute rounded-full blur-[118px]",
          motionOn && "hero-dream-anim-b",
        )}
      />
      <div
        className={cn(
          "hero-dream-orb hero-dream-orb-c absolute rounded-full blur-[86px]",
          motionOn && "hero-dream-anim-c",
        )}
      />
      {/* Mimari cephe hissî — yükselen ince sıra sıra */}
      <div className={cn("hero-dream-strata absolute inset-x-[-8%]", motionOn && "hero-dream-anim-strata")} />
      <div className={cn("hero-dream-veil absolute inset-0", motionOn && "hero-dream-anim-veil")} />
      <div
        className={cn(
          "hero-dream-rise absolute inset-x-[-15%] bottom-[-22%] h-[65%]",
          motionOn && "hero-dream-anim-rise",
        )}
      />
      <div
        className={cn(
          "hero-dream-horizon absolute inset-x-[10%] bottom-[18%] h-px opacity-[0.58]",
          motionOn && "hero-dream-anim-horizon",
        )}
      />
      {/* İnce film taneleri — iki ölçek */}
      <div className={cn("hero-dream-grain absolute inset-0", motionOn && "hero-dream-anim-grain")} />
      <div className={cn("hero-dream-grain-fine absolute inset-0", motionOn && "hero-dream-anim-grain-fine")} />
    </div>
  );
}
