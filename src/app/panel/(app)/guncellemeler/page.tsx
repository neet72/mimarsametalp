import Image from "next/image";
import { requireClient } from "@/actions/client/guard";
import { listPublishedUpdatesForUser } from "@/lib/portal/queries";
import { renderMarkdownSafe } from "@/lib/portal/markdown";
import { SafeHtml } from "@/components/security/SafeHtml";
import { Reveal } from "@/components/motion/FadeIn";

export default async function PanelUpdatesPage() {
  const { client } = await requireClient();
  const updates = await listPublishedUpdatesForUser(client.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Güncellemeler</h1>
        <p className="mt-2 text-muted">Yayınlanan proje gelişmeleri.</p>
      </div>

      {updates.length === 0 ? (
        <p className="text-muted">Henüz yayınlanmış güncelleme yok.</p>
      ) : (
        <ol className="space-y-8">
          {updates.map((u, i) => (
            <Reveal key={u.id} delay={i * 0.04}>
              <li className="border-b border-border pb-8">
                <p className="text-xs font-medium uppercase tracking-wider text-accent">{u.project.title}</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-primary">{u.title}</h2>
                {u.publishedAt ? (
                  <p className="mt-1 text-xs text-muted">{u.publishedAt.toLocaleDateString("tr-TR")}</p>
                ) : null}
                <div className="prose-panel mt-4 text-sm leading-relaxed text-primary/90">
                  <SafeHtml html={renderMarkdownSafe(u.body)} />
                </div>
                {u.media.length ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {u.media.map((m) => (
                      <li key={m.id} className="overflow-hidden rounded-xl border border-border">
                        {m.mediaType === "image" ? (
                          <a href={m.cloudinaryUrl} target="_blank" rel="noreferrer" className="relative block aspect-[4/3]">
                            <Image
                              src={m.cloudinaryUrl}
                              alt={m.caption ?? ""}
                              fill
                              className="object-cover"
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
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </Reveal>
          ))}
        </ol>
      )}
    </div>
  );
}
