import type { Metadata } from "next";
import Link from "next/link";
import { PanelLoginForm } from "@/components/panel/PanelLoginForm";

export const metadata: Metadata = {
  title: "Müşteri girişi",
  description: "Samet Alp Mimarlık müşteri proje paneline güvenli giriş.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelLoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(166_124_82_/_0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgb(15_23_42_/_0.06),_transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:text-accent"
        >
          Samet Alp Mimarlık
        </Link>
        <Link
          href="/iletisim"
          className="text-xs font-medium text-muted transition-colors hover:text-primary"
        >
          Destek
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        <PanelLoginForm />
      </div>
    </div>
  );
}
