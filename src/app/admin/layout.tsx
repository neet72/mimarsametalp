import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-zinc-950 text-zinc-100 antialiased">{children}</div>
  );
}
