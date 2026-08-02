import Image from "next/image";
import { requireClient } from "@/actions/client/guard";
import { listPublishedUpdatesForUser } from "@/lib/portal/queries";
import { renderMarkdownSafe } from "@/lib/portal/markdown";
import { cn } from "@/lib/cn";

export default async function PanelUpdatesPage() {
  const { client } = await requireClient();
  const updates = await listPublishedUpdatesForUser(client.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Güncellemeler</h1>
        <p className="mt-2 max-w-xl text-muted">
          Projenize ait yayınlanmış gelişmeler, raporlar ve görseller burada listelenir.
        </p>
      </div>

      {updates.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-white/60 px-6 py-16 text-center sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgb(166_124_82_/_0.08),_transparent_65%)]"
          />
          <p className="relative font-display text-xl font-semibold text-primary">Henüz güncelleme yok</p>
          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Ofis yeni bir gelişme yayınladığında burada görünecek. Özet sayfasından proje aşamalarını takip
            edebilirsiniz.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-0 border-l border-border/80 pl-6 sm:pl-8">
          {updates.map((u, i) => (
            <li key={u.id} className={cn("relative pb-10 last:pb-0", i === 0 && "pt-0")}>
              <span
                aria-hidden
                className="absolute -left-[1.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-surface sm:-left-[2.05rem]"
              />
              <article className="rounded-2xl border border-border bg-white/50 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium uppercase tracking-wider text-accent">{u.project.title}</span>
                  {u.stage?.name ? (
                    <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-muted">{u.stage.name}</span>
                  ) : null}
                  {u.publishedAt ? (
                    <time className="text-muted" dateTime={u.publishedAt.toISOString()}>
                      {u.publishedAt.toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  ) : null}
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-primary">{u.title}</h2>
                <div
                  className="prose-panel mt-4 text-sm leading-relaxed text-primary/90"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(u.body) }}
                />
                {u.media.length ? (
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {u.media.map((m) => (
                      <li key={m.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                        {m.mediaType === "image" ? (
                          <a
                            href={m.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block aspect-[4/3]"
                          >
                            <Image
                              src={m.cloudinaryUrl}
                              alt={m.caption ?? ""}
                              fill
                              className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                              sizes="(max-width: 768px) 50vw, 300px"
                            />
                          </a>
                        ) : m.mediaType === "video" ? (
                          <video src={m.cloudinaryUrl} controls className="aspect-video w-full bg-black" />
                        ) : (
                          <a
                            href={m.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block px-4 py-6 text-sm text-accent underline"
                          >
                            {m.caption || "Dosyayı aç (PDF)"}
                          </a>
                        )}
                        {m.caption && m.mediaType === "image" ? (
                          <p className="border-t border-border px-3 py-2 text-xs text-muted">{m.caption}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
