import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { PanelShell } from "@/components/panel/PanelShell";

export default async function PanelAppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "client") {
    redirect("/panel/giris");
  }

  return <PanelShell userName={session.user.name ?? "Müşteri"}>{children}</PanelShell>;
}
