"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
