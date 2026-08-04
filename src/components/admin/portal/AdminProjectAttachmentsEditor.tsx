"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import type { ClientAttachmentKind } from "@prisma/client";
import {
  createClientProjectAttachmentLink,
  deleteClientProjectAttachment,
  uploadClientProjectAttachmentFile,
} from "@/actions/admin/client-attachments";
import { useAdminToast } from "@/components/admin/ui/toast";
import { PORTAL_ACCEPT_ATTR } from "@/lib/portal/media-types";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";
import { ExternalLink, FileUp, Link2 } from "lucide-react";

type AttachRow = {
  id: string;
  kind: ClientAttachmentKind;
  name: string;
  url: string;
  uploadedByEmail: string | null;
  createdAt: string;
};

export function AdminProjectAttachmentsEditor({
  projectId,
  items,
}: {
  projectId: string;
  items: AttachRow[];
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await createClientProjectAttachmentLink({
        projectId,
        name: String(fd.get("name") ?? ""),
        url: String(fd.get("url") ?? ""),
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Link eklendi." });
      form.reset();
      router.refresh();
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startTransition(async () => {
      const res = await uploadClientProjectAttachmentFile({
        projectId,
        file,
        name: file.name,
      });
      if (!res.ok) toast.error({ title: res.error });
      else {
        toast.success({ title: "Dosya yüklendi." });
        router.refresh();
      }
      e.target.value = "";
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-100">Ekler</h2>
        <p className="text-sm text-zinc-500">
          Dosya yükleyin (RAR dahil) veya Google Drive vb. harici link ekleyin. Müşteri panelinde görünür.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onLink} className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Link2 className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
            Harici link
          </p>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Görünen ad</span>
            <input
              name="name"
              required
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
              placeholder="Ruhsat dosyaları"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">URL</span>
            <input
              name="url"
              type="url"
              required
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
              placeholder="https://drive.google.com/..."
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            Link ekle
          </button>
        </form>

        <div className="space-y-3 rounded-lg border border-zinc-800 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <FileUp className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
            Dosya yükle
          </p>
          <p className="text-xs text-zinc-500">PDF, Office, RAR, görsel/video — max 50MB.</p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-3 py-2.5 text-sm text-[rgb(200,170,130)] hover:border-[rgb(166,124,82)]/50">
            Dosya seç
            <input
              ref={fileRef}
              type="file"
              accept={`${PORTAL_ACCEPT_ATTR},.rar`}
              className="hidden"
              disabled={pending}
              onChange={onFile}
            />
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-600">Henüz ek yok.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-lg border border-zinc-800">
          {items.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <a
                  href={
                    row.kind === "FILE"
                      ? withCloudinaryAttachment(row.url, row.name)
                      : row.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-[rgb(200,170,130)] hover:underline"
                >
                  {row.kind === "EXTERNAL_LINK" ? (
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  ) : null}
                  {row.name}
                </a>
                <p className="text-xs text-zinc-500">
                  {new Date(row.createdAt).toLocaleDateString("tr-TR")}
                  {row.uploadedByEmail ? ` · ${row.uploadedByEmail}` : ""}
                  {row.kind === "EXTERNAL_LINK" ? " · Link" : " · Dosya"}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                className="text-red-400 hover:underline disabled:opacity-50"
                onClick={() =>
                  startTransition(async () => {
                    const res = await deleteClientProjectAttachment({ id: row.id });
                    if (!res.ok) toast.error({ title: res.error });
                    else {
                      toast.success({ title: "Silindi." });
                      router.refresh();
                    }
                  })
                }
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
