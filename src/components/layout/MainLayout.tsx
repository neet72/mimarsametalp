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
      <main id="icerik" className="min-h-0 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingWhatsAppCTA />
      <Footer />
    </div>
  );
}
