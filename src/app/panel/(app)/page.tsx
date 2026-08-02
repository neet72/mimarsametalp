import Image from "next/image";
import { requireClient } from "@/actions/client/guard";
import { listClientProjectsForUser } from "@/lib/portal/queries";
import { Reveal } from "@/components/motion/FadeIn";

export default async function PanelOverviewPage() {
  const { client } = await requireClient();
  const projects = await listClientProjectsForUser(client.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Projeleriniz</h1>
        <p className="mt-2 text-muted">Güncel durum ve aşama takibi.</p>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted">Henüz size atanmış bir proje yok.</p>
      ) : (
        <ul className="space-y-8">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <article className="overflow-hidden rounded-2xl border border-border bg-white/40">
                {p.coverImageUrl ? (
                  <div className="relative aspect-[21/9] w-full bg-border/40">
                    <Image
                      src={p.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 960px"
                    />
                  </div>
                ) : null}
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-primary">{p.title}</h2>
                    {p.address ? <p className="mt-1 text-sm text-muted">{p.address}</p> : null}
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-accent">{p.status}</p>
                  </div>
                  {p.stages.length ? (
                    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {p.stages.map((s) => (
                        <li
                          key={s.id}
                          className="rounded-lg border border-border/80 bg-surface px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-primary">{s.name}</p>
                          <p className="text-xs text-muted">{s.status}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-muted">Aşama henüz tanımlanmadı.</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
