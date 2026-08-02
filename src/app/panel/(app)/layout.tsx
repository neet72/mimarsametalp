import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { PanelShell } from "@/components/panel/PanelShell";
import { countPublishedUpdatesForUser } from "@/lib/portal/queries";

export default async function PanelAppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "client") {
    redirect("/panel/giris");
  }

  const updateCount = session.user.id
    ? await countPublishedUpdatesForUser(session.user.id).catch(() => 0)
    : 0;

  return (
    <PanelShell userName={session.user.name ?? "Müşteri"} updateCount={updateCount}>
      {children}
    </PanelShell>
  );
}
