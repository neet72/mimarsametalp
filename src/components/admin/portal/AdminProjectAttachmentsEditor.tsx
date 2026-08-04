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
import {
  AdminSectionCard,
  AdminStatusPill,
  adminBtnAccentClass,
  adminBtnSecondaryClass,
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/ui/AdminPageChrome";
import { PORTAL_ACCEPT_ATTR } from "@/lib/portal/media-types";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";
import { cn } from "@/lib/cn";
import { ExternalLink, FileText, FileUp, Link2, Paperclip, Trash2 } from "lucide-react";

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
    <AdminSectionCard
      id="bolum-ekler"
      eyebrow="Dosyalar"
      title="Ekler"
      description="Dosya yükleyin (RAR dahil) veya Google Drive vb. harici link ekleyin."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <form
          onSubmit={onLink}
          className="space-y-3 rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 p-4"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10">
              <Link2 className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
            </span>
            Harici link
          </p>
          <label className="block">
            <span className={adminLabelClass}>Görünen ad</span>
            <input
              name="name"
              required
              className={adminFieldClass}
              placeholder="Ruhsat dosyaları"
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>URL</span>
            <input
              name="url"
              type="url"
              required
              className={adminFieldClass}
              placeholder="https://drive.google.com/..."
            />
          </label>
          <button type="submit" disabled={pending} className={cn(adminBtnAccentClass, "w-full sm:w-auto")}>
            Link ekle
          </button>
        </form>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 p-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(166,124,82)]/30 bg-[rgb(166,124,82)]/10">
                <FileUp className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
              </span>
              Dosya yükle
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              PDF, Office, RAR, görsel/video — max 50MB.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            className={cn(adminBtnSecondaryClass, "w-full")}
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" aria-hidden />
            {pending ? "Yükleniyor…" : "Dosya seç"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={`${PORTAL_ACCEPT_ATTR},.rar`}
            className="hidden"
            disabled={pending}
            onChange={onFile}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center">
          <FileText className="h-8 w-8 text-zinc-600" aria-hidden />
          <p className="text-sm text-zinc-500">Henüz ek yok.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800">
          {items.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[rgb(200,170,130)]">
                  {row.kind === "EXTERNAL_LINK" ? (
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  ) : (
                    <FileText className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={
                        row.kind === "FILE"
                          ? withCloudinaryAttachment(row.url, row.name)
                          : row.url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-medium text-[rgb(200,170,130)] underline-offset-2 hover:underline"
                    >
                      {row.name}
                    </a>
                    <AdminStatusPill tone="neutral">
                      {row.kind === "EXTERNAL_LINK" ? "Link" : "Dosya"}
                    </AdminStatusPill>
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {new Date(row.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {row.uploadedByEmail ? ` · ${row.uploadedByEmail}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={pending}
                aria-label="Eki sil"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-lg border border-red-900/40 text-red-300 hover:bg-red-950/40 disabled:opacity-50 sm:self-center"
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
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminSectionCard>
  );
}
