"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { ScrollManager } from "./ScrollManager";
import { FloatingWhatsAppCTA } from "./FloatingWhatsAppCTA";
import { SmoothScrollHost } from "./SmoothScrollHost";

/**
 * Public chrome — /admin ve /panel’de Navbar/Footer/WhatsApp/Lenis yok.
 * Pathname istemci+SSR’da güvenilir; root layout headers() boş kalsa bile doğru çalışır.
 */
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAppShell = pathname.startsWith("/admin") || pathname.startsWith("/panel");

  if (isAppShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SmoothScrollHost />
      <ScrollManager />
      <Navbar />
      <div aria-hidden className="h-[var(--header-h)]" />
      <main
        id="icerik"
        className="min-h-0 flex-1 pb-[max(5.5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))]"
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingWhatsAppCTA />
      <Footer />
    </div>
  );
}
