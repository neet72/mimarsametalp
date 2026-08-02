import { requireClient } from "@/actions/client/guard";
import { listClientProjectsForUser, listClientRequestsForUser } from "@/lib/portal/queries";
import { PanelDeliveryForm } from "@/components/panel/PanelDeliveryForm";

const STATUS_TR: Record<string, string> = {
  new: "Yeni",
  in_progress: "İşleniyor",
  done: "Tamamlandı",
  cancelled: "İptal",
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export default async function PanelRequestsPage({ searchParams }: PageProps) {
  const { client } = await requireClient();
  const sp = (await searchParams) ?? {};
  const [projects, requests] = await Promise.all([
    listClientProjectsForUser(client.id),
    listClientRequestsForUser(client.id),
  ]);

  const initial = {
    projectId: firstParam(sp.projectId),
    subject: firstParam(sp.subject),
    message: firstParam(sp.message),
  };

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">İstekler</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Proje ile ilgili taleplerinizi, sorularınızı veya değişiklik isteklerinizi buradan iletin. Ofis
          tarafına e-posta ile de düşer.
        </p>
      </div>

      <PanelDeliveryForm
        projects={projects.map((p) => ({ id: p.id, title: p.title }))}
        defaults={{ fullName: client.fullName, phone: client.phone ?? "" }}
        initial={initial}
      />

      {requests.length > 0 ? (
        <section aria-labelledby="request-history" className="space-y-3">
          <h2 id="request-history" className="text-center font-display text-lg font-semibold text-primary">
            Gönderdiğiniz istekler
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/80 text-left">
            {requests.map((r) => (
              <li key={r.id} className="px-4 py-3.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-primary">{r.subject}</p>
                  <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-xs text-muted">
                    {STATUS_TR[r.status] ?? r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {r.project.title} · {r.createdAt.toLocaleString("tr-TR")}
                </p>
                {r.notes ? <p className="mt-2 line-clamp-3 text-muted">{r.notes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
