import Link from "next/link";
import { requireClient } from "@/actions/client/guard";
import { listPublishedUpdatesForUser } from "@/lib/portal/queries";
import { PanelUpdatesFeed } from "@/components/panel/PanelUpdatesFeed";

export default async function PanelUpdatesPage() {
  const { client } = await requireClient();
  const updates = await listPublishedUpdatesForUser(client.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-surface via-surface to-accent/[0.06] px-5 py-6 sm:px-7 sm:py-8">
        <div className="text-center sm:text-left">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Güncellemeler</h1>
          <p className="mx-auto mt-2 max-w-xl text-muted sm:mx-0">
            Projenize ait yayınlanmış gelişmeler, raporlar ve görseller. Her kartın altından doğrudan hata
            bildirimi veya istek gönderebilirsiniz.
          </p>
        </div>
      </div>

      {updates.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/80 px-6 py-16 text-center sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgb(166_124_82_/_0.08),_transparent_65%)]"
          />
          <p className="relative font-display text-xl font-semibold text-primary">Henüz güncelleme yok</p>
          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Ofis yeni bir gelişme yayınladığında burada görünecek. Özet sayfasından proje aşamalarını takip
            edebilirsiniz.
          </p>
          <Link
            href="/panel"
            className="relative mt-6 inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-medium text-primary"
          >
            Özet’e dön
          </Link>
        </div>
      ) : (
        <PanelUpdatesFeed
          updates={updates.map((u) => ({
            id: u.id,
            title: u.title,
            body: u.body,
            publishedAt: u.publishedAt?.toISOString() ?? null,
            project: u.project,
            stage: u.stage ? { name: u.stage.name } : null,
            media: u.media.map((m) => ({
              id: m.id,
              cloudinaryUrl: m.cloudinaryUrl,
              mediaType: m.mediaType,
              caption: m.caption,
            })),
          }))}
        />
      )}
    </div>
  );
}
