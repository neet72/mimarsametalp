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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(166_124_82_/_0.16),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgb(15_23_42_/_0.05),_transparent_45%)]"
      />
      <div className="relative z-10 mb-8 text-center">
        <Link
          href="/"
          className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-primary transition-colors hover:text-accent"
        >
          Samet Alp Mimarlık
        </Link>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <PanelLoginForm />
      </div>
      <p className="relative z-10 mt-8 text-center text-xs text-muted">
        <Link href="/iletisim" className="hover:text-primary">
          Destek / iletişim
        </Link>
      </p>
    </div>
  );
}
