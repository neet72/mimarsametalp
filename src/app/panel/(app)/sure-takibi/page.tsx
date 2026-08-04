import { requireClient } from "@/actions/client/guard";
import { listRoadmapDurationForUser } from "@/lib/portal/queries";
import {
  daysToWeeks,
  durationDays,
  formatWeeksTr,
  projectCategoryTr,
  stageStatusTr,
  summarizeRoadmapByCategory,
} from "@/lib/portal/labels";

export default async function PanelDurationPage() {
  const { client } = await requireClient();
  const projects = await listRoadmapDurationForUser(client.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">
          Süre Takibi
        </h1>
        <p className="mt-2 text-muted">
          Yol haritası adımlarının süreleri ve kategoriye göre toplam (hafta).
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/80 px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-primary">Proje yok</p>
        </div>
      ) : (
        <ul className="space-y-10">
          {projects.map((p) => {
            const summary = summarizeRoadmapByCategory(p.roadmapItems);
            return (
              <li key={p.id} className="space-y-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-primary">{p.title}</h2>
                </div>

                {summary.length > 0 ? (
                  <ul className="flex flex-wrap gap-2" aria-label="Kategori süre özeti">
                    {summary.map((row) => (
                      <li
                        key={row.category}
                        className="rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs text-primary"
                      >
                        <span className="font-semibold text-accent">{row.label}</span>
                        <span className="text-muted"> · </span>
                        {formatWeeksTr(row.weeks)}
                        <span className="text-muted"> ({row.days} gün)</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {p.roadmapItems.length === 0 ? (
                  <p className="text-sm text-muted">Bu proje için yol haritası adımı yok.</p>
                ) : (
                  <ol className="relative space-y-0 border-l border-border/80 pl-5 sm:pl-6">
                    {p.roadmapItems.map((item) => {
                      const ongoing = !item.endDate;
                      const days = durationDays(item.startDate, item.endDate);
                      return (
                        <li key={item.id} className="relative pb-5 last:pb-0">
                          <span
                            aria-hidden
                            className="absolute -left-[1.35rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-accent bg-surface sm:-left-[1.6rem]"
                          />
                          <div className="rounded-xl border border-border bg-surface/80 px-4 py-3.5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
                              {projectCategoryTr(item.category)}
                            </p>
                            <p className="mt-1 font-display text-sm font-semibold tracking-tight text-primary sm:text-base">
                              {item.title}
                            </p>
                            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                              <div>
                                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                  Başlangıç
                                </dt>
                                <dd className="mt-0.5 text-primary">
                                  {item.startDate.toLocaleDateString("tr-TR")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                  Bitiş
                                </dt>
                                <dd className="mt-0.5 text-primary">
                                  {ongoing
                                    ? "Devam ediyor"
                                    : item.endDate!.toLocaleDateString("tr-TR")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                  Süre
                                </dt>
                                <dd className="mt-0.5 font-medium text-accent">
                                  {days} gün · {formatWeeksTr(daysToWeeks(days))}
                                </dd>
                              </div>
                            </dl>
                            {item.note.trim() ? (
                              <p className="mt-3 text-sm leading-relaxed text-muted">{item.note}</p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {p.stages.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Panel aşamaları
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {p.stages.map((s) => {
                        const start = s.targetDate;
                        const end = s.completedDate;
                        const days = start != null ? durationDays(start, end) : null;
                        return (
                          <li
                            key={s.id}
                            className="rounded-lg border border-border/80 bg-surface px-3 py-3 text-sm"
                          >
                            <p className="font-medium text-primary">{s.name}</p>
                            <p className="mt-0.5 text-xs text-muted">{stageStatusTr(s.status)}</p>
                            <p className="mt-1 text-xs text-muted/90">
                              {start
                                ? `Hedef: ${start.toLocaleDateString("tr-TR")}`
                                : "Tarih yok"}
                              {end ? ` · Bitti: ${end.toLocaleDateString("tr-TR")}` : ""}
                              {days != null ? ` · ${days} gün` : ""}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
