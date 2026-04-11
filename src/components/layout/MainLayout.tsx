import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
