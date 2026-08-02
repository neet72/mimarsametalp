import { prisma } from "@/lib/db/prisma";
import { DeliveryStatusSelect } from "@/components/admin/portal/DeliveryStatusSelect";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100">
          Teslim talepleri
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Panelden gelen teslim / adres talepleri.</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600">Henüz talep yok.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">{r.project.title}</p>
                  <p className="text-zinc-500">
                    {r.fullName} · {r.phone} · @{r.client.username}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-zinc-300">{r.address}</p>
                  {r.notes ? <p className="mt-2 text-zinc-500">{r.notes}</p> : null}
                  <p className="mt-2 text-xs text-zinc-600">{r.createdAt.toISOString()}</p>
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
