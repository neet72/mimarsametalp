import { prisma } from "@/lib/db/prisma";
import { DeliveryStatusSelect } from "@/components/admin/portal/DeliveryStatusSelect";
import { AdminEmptyState, AdminPageHeader, AdminStatusPill } from "@/components/admin/ui/AdminPageChrome";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryRequestsPage() {
  const rows = await prisma.clientDeliveryRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { title: true } },
      client: { select: { fullName: true, username: true } },
    },
    take: 100,
  });

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="İstekler"
        description="Müşteri panelinden gelen istek ve iletişim mesajları."
        actions={
          newCount > 0 ? <AdminStatusPill tone="accent">{newCount} yeni</AdminStatusPill> : undefined
        }
      />

      {rows.length === 0 ? (
        <AdminEmptyState
          title="Henüz istek yok"
          hint="Müşteri /panel/istekler formundan gönderince burada listelenir."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm transition-colors hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-zinc-100">{r.subject}</p>
                    {r.status === "new" ? <AdminStatusPill tone="accent">yeni</AdminStatusPill> : null}
                  </div>
                  <p className="mt-1 text-zinc-500">
                    {r.project.title} · {r.fullName} · {r.phone} · @{r.client.username}
                  </p>
                  {r.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-zinc-200">{r.notes}</p>
                  ) : null}
                  {r.address ? (
                    <p className="mt-2 text-sm text-zinc-500">Adres: {r.address}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-zinc-600">
                    {r.createdAt.toLocaleString("tr-TR")}
                  </p>
                </div>
                <DeliveryStatusSelect id={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
