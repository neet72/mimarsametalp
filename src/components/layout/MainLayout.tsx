import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageTransition } from "./PageTransition";
import { ScrollManager } from "./ScrollManager";
import { FloatingWhatsAppCTA } from "./FloatingWhatsAppCTA";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
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
