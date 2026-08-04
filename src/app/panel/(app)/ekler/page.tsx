import { ExternalLink, FileText } from "lucide-react";
import { requireClient } from "@/actions/client/guard";
import { listAttachmentsForUser } from "@/lib/portal/queries";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";

export default async function PanelAttachmentsPage() {
  const { client } = await requireClient();
  const rows = await listAttachmentsForUser(client.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Ekler</h1>
        <p className="mt-2 text-muted">
          Projenize ait dosyalar ve harici bağlantılar (Drive vb.).
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/80 px-6 py-14 text-center">
          <p className="font-display text-xl font-semibold text-primary">Henüz ek yok</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Ofis dosya veya link eklediğinde burada görünecek.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/80">
          {rows.map((row) => {
            const href =
              row.kind === "FILE" ? withCloudinaryAttachment(row.url, row.name) : row.url;
            return (
              <li key={row.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-accent">
                    {row.kind === "EXTERNAL_LINK" ? (
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    ) : (
                      <FileText className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium uppercase tracking-wider text-accent">
                      {row.project.title}
                    </span>
                    <span className="mt-0.5 block font-medium text-primary">{row.name}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {row.createdAt.toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {row.uploadedByEmail ? ` · ${row.uploadedByEmail}` : ""}
                      {row.kind === "EXTERNAL_LINK" ? " · Harici link" : " · Dosya"}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
