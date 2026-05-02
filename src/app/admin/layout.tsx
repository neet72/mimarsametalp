import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Samet Alp Mimarlık",
  description: "Samet Alp Mimarlık yönetim paneli.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-zinc-950 text-zinc-100 antialiased">{children}</div>
  );
}
