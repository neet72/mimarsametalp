import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Müşteri Paneli | Samet Alp Mimarlık",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function PanelRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-surface text-primary antialiased">{children}</div>;
}
