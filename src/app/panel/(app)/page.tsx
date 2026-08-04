import Image from "next/image";
import Link from "next/link";
import { requireClient } from "@/actions/client/guard";
import {
  listClientProjectsForUser,
  countPublishedUpdatesForUser,
} from "@/lib/portal/queries";
import { projectStatusTr, projectCategoryTr } from "@/lib/portal/labels";
import { shouldUnoptimizeImage } from "@/lib/media/next-image";
import { PanelProjectFoldouts } from "@/components/panel/PanelProjectFoldouts";

export default async function PanelOverviewPage() {
  const { client } = await requireClient();
  const [projects, updateCount] = await Promise.all([
    listClientProjectsForUser(client.id),
    countPublishedUpdatesForUser(client.id),
  ]);

  const doneStages = projects.reduce(
    (n, p) => n + p.stages.filter((s) => s.status === "DONE").length,
    0,
  );
  const totalStages = projects.reduce((n, p) => n + p.stages.length, 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Özet</h1>
          <p className="mt-2 text-muted">
            Projelerinize tıklayarak güncelleme ve yol haritasını açın.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/panel/guncellemeler"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-muted transition-colors hover:border-accent/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Güncellemeler
            {updateCount > 0 ? (
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                {updateCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/panel/istekler"
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            İstek gönder
          </Link>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Proje", value: String(projects.length) },
          { label: "Güncelleme", value: String(updateCount) },
          { label: "Aşama", value: totalStages ? `${doneStages}/${totalStages}` : "—" },
          {
            label: "Durum",
            value: projects[0] ? projectStatusTr(projects[0].status) : "—",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface/80 px-4 py-4">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-xl font-semibold tracking-tight text-primary">{s.value}</dd>
          </div>
        ))}
      </dl>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/80 px-6 py-14 text-center sm:px-10">
          <p className="font-display text-xl font-semibold text-primary">Henüz atanmış proje yok</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Ofis size bir portal projesi atadığında burada görünecek. Sorunuz varsa İstekler’den
            yazabilirsiniz.
          </p>
          <Link
            href="/panel/istekler"
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-white"
          >
            İstek gönder
          </Link>
        </div>
      ) : (
        <section aria-labelledby="projects-heading" className="space-y-4">
          <h2 id="projects-heading" className="font-display text-lg font-semibold text-primary">
            Projeleriniz
          </h2>
          <ul className="space-y-6 sm:space-y-8">
            {projects.map((p) => {
              const progress =
                p.stages.length === 0
                  ? 0
                  : Math.round(
                      (p.stages.filter((s) => s.status === "DONE").length / p.stages.length) * 100,
                    );
              return (
                <li key={p.id}>
                  <article className="overflow-hidden rounded-2xl border border-border bg-surface/80">
                    {p.coverImageUrl ? (
                      <div className="relative aspect-[16/9] w-full bg-border/40 sm:aspect-[21/9]">
                        <Image
                          src={p.coverImageUrl}
                          alt={p.title}
                          fill
                          unoptimized={shouldUnoptimizeImage(p.coverImageUrl)}
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 960px"
                          priority={false}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-semibold text-primary">{p.title}</h3>
                          {p.address ? <p className="mt-1 text-sm text-muted">{p.address}</p> : null}
                          <p className="mt-2 text-xs font-medium uppercase tracking-wider text-accent">
                            {projectCategoryTr(p.category)} · {projectStatusTr(p.status)}
                          </p>
                        </div>
                        {p.stages.length ? (
                          <p className="text-xs tabular-nums text-muted">%{progress}</p>
                        ) : null}
                      </div>

                      {p.stages.length ? (
                        <div>
                          <div className="mb-1.5 flex justify-between text-xs text-muted">
                            <span>İlerleme</span>
                            <span>%{progress}</span>
                          </div>
                          <div
                            className="h-2 overflow-hidden rounded-full bg-border/80"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${p.title} ilerleme`}
                          >
                            <div
                              className={
                                progress === 0
                                  ? "h-full w-0 rounded-full bg-accent"
                                  : progress <= 10
                                    ? "h-full w-[10%] rounded-full bg-accent"
                                    : progress <= 20
                                      ? "h-full w-[20%] rounded-full bg-accent"
                                      : progress <= 30
                                        ? "h-full w-[30%] rounded-full bg-accent"
                                        : progress <= 40
                                          ? "h-full w-[40%] rounded-full bg-accent"
                                          : progress <= 50
                                            ? "h-full w-[50%] rounded-full bg-accent"
                                            : progress <= 60
                                              ? "h-full w-[60%] rounded-full bg-accent"
                                              : progress <= 70
                                                ? "h-full w-[70%] rounded-full bg-accent"
                                                : progress <= 80
                                                  ? "h-full w-[80%] rounded-full bg-accent"
                                                  : progress <= 90
                                                    ? "h-full w-[90%] rounded-full bg-accent"
                                                    : "h-full w-full rounded-full bg-accent"
                              }
                            />
                          </div>
                        </div>
                      ) : null}

                      <PanelProjectFoldouts
                        updateTotal={p._count.updates}
                        updates={p.updates.map((u) => ({
                          id: u.id,
                          title: u.title,
                          eventDate: u.eventDate?.toISOString() ?? null,
                          publishedAt: u.publishedAt?.toISOString() ?? null,
                        }))}
                        roadmapItems={p.roadmapItems.map((r) => ({
                          id: r.id,
                          title: r.title,
                          note: r.note,
                          category: r.category,
                          startDate: r.startDate.toISOString(),
                          endDate: r.endDate?.toISOString() ?? null,
                        }))}
                        stages={p.stages.map((s) => ({
                          id: s.id,
                          name: s.name,
                          status: s.status,
                          targetDate: s.targetDate?.toISOString() ?? null,
                        }))}
                      />

                      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border/70 pt-3">
                        <Link
                          href="/panel/bakiye"
                          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                        >
                          Bakiye
                        </Link>
                        <Link
                          href="/panel/ekler"
                          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                        >
                          Ekler
                        </Link>
                        <Link
                          href="/panel/sure-takibi"
                          className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                        >
                          Süre takibi
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
