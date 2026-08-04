"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  createClientProjectUpdate,
  deleteClientUpdateMedia,
  publishClientProjectUpdate,
  unpublishClientProjectUpdate,
  updateClientProjectUpdate,
  uploadClientUpdateMedia,
} from "@/actions/admin/client-updates";
import { useAdminToast } from "@/components/admin/ui/toast";
import {
  AdminSectionCard,
  AdminStatusPill,
  adminBtnAccentClass,
  adminBtnSecondaryClass,
  adminFieldClass,
  adminLabelClass,
  adminTextareaClass,
} from "@/components/admin/ui/AdminPageChrome";
import { PORTAL_ACCEPT_ATTR, portalMediaKindLabel } from "@/lib/portal/media-types";
import { withCloudinaryAttachment } from "@/lib/storage/cloudinary-url";
import { cn } from "@/lib/cn";
import { FileText, ImageIcon, Video, Upload } from "lucide-react";

type StageOpt = { id: string; name: string };
type MediaRow = { id: string; cloudinaryUrl: string; mediaType: string; caption: string | null };

function mediaDownloadName(m: MediaRow) {
  if (m.caption?.trim()) return m.caption.trim();
  const ext =
    m.mediaType === "pdf"
      ? ".pdf"
      : m.mediaType === "doc"
        ? ".docx"
        : m.mediaType === "sheet"
          ? ".xlsx"
          : "";
  return `${portalMediaKindLabel(m.mediaType)}${ext}`;
}

export function AdminClientUpdateEditor({
  projectId,
  stages,
  initial,
}: {
  projectId: string;
  stages: StageOpt[];
  initial?: {
    id: string;
    title: string;
    body: string;
    stageId: string | null;
    isPublished: boolean;
    eventDate: string | null;
    media: MediaRow[];
  };
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [updateId, setUpdateId] = useState(initial?.id ?? "");
  const [media, setMedia] = useState(initial?.media ?? []);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const fileRef = useRef<HTMLInputElement>(null);
  const defaultEventDate =
    initial?.eventDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const payload = {
        title: String(fd.get("title") ?? ""),
        body: String(fd.get("body") ?? ""),
        stageId: String(fd.get("stageId") || "") || null,
        eventDate: String(fd.get("eventDate") || "") || null,
      };
      if (!updateId) {
        const res = await createClientProjectUpdate({ projectId, ...payload });
        if (!res.ok) {
          toast.error({ title: res.error });
          return;
        }
        setUpdateId(res.data?.id ?? "");
        toast.success({ title: "Rapor taslağı oluşturuldu." });
        router.replace(`/admin/client-projects/${projectId}/updates?id=${res.data?.id}`);
        router.refresh();
        return;
      }
      const res = await updateClientProjectUpdate({ id: updateId, ...payload });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Rapor kaydedildi." });
      router.refresh();
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (!updateId) {
      toast.error({ title: "Önce raporu kaydedin, sonra dosya ekleyin." });
      e.target.value = "";
      return;
    }
    startTransition(async () => {
      let okCount = 0;
      for (const file of files) {
        const res = await uploadClientUpdateMedia({ updateId, file, caption: "" });
        if (!res.ok) {
          toast.error({ title: `${file.name}: ${res.error}` });
          continue;
        }
        if (res.data) {
          okCount += 1;
          setMedia((m) => [
            ...m,
            {
              id: res.data!.id,
              cloudinaryUrl: res.data!.url,
              mediaType: res.data!.mediaType,
              caption: res.data!.caption ?? file.name,
            },
          ]);
        }
      }
      if (okCount) toast.success({ title: `${okCount} dosya yüklendi.` });
      router.refresh();
      e.target.value = "";
    });
  }

  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");
  const docs = media.filter((m) => m.mediaType !== "image" && m.mediaType !== "video");

  function deleteOne(id: string) {
    startTransition(async () => {
      const res = await deleteClientUpdateMedia({ id });
      if (!res.ok) toast.error({ title: res.error });
      else {
        setMedia((list) => list.filter((x) => x.id !== id));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <AdminSectionCard
        eyebrow="Rapor"
        title="Saha raporu / güncelleme"
        description="Markdown ile yazın; görsel, video ve dosya (PDF, Word, Excel, RAR) ekleyin."
        actions={
          updateId ? (
            <AdminStatusPill tone={isPublished ? "ok" : "neutral"}>
              {isPublished ? "Yayında" : "Taslak"}
            </AdminStatusPill>
          ) : null
        }
      >
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className={adminLabelClass}>Rapor başlığı</span>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              placeholder="Örn. 12. hafta şantiye raporu"
              className={adminFieldClass}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>İlgili aşama</span>
              <select
                name="stageId"
                defaultValue={initial?.stageId ?? ""}
                className={adminFieldClass}
              >
                <option value="">— Genel / aşamasız —</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabelClass}>İşlem tarihi</span>
              <input
                name="eventDate"
                type="date"
                required
                defaultValue={defaultEventDate}
                className={adminFieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className={adminLabelClass}>Rapor metni (Markdown)</span>
            <textarea
              name="body"
              required
              rows={12}
              defaultValue={initial?.body}
              placeholder={"## Özet\nBu hafta...\n\n- Madde 1\n- Madde 2"}
              className={cn(adminTextareaClass, "min-h-[220px] font-mono text-[13px] leading-relaxed sm:min-h-[280px]")}
            />
            <span className="mt-1.5 block text-[11px] text-zinc-600">
              ## başlık, **kalın**, - liste, [link](https://…) desteklenir.
            </span>
          </label>

          <button type="submit" disabled={pending} className={cn(adminBtnAccentClass, "w-full sm:w-auto")}>
            {updateId ? "Raporu kaydet" : "Taslak oluştur"}
          </button>
        </form>
      </AdminSectionCard>

      {updateId ? (
        <AdminSectionCard
          eyebrow="Medya"
          title="Medya ve dosyalar"
          description="Görsel · Video · PDF · Office · RAR — max 50MB, çoklu seçim."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {isPublished ? (
                <button
                  type="button"
                  disabled={pending}
                  className={cn(adminBtnSecondaryClass, "w-full sm:w-auto")}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await unpublishClientProjectUpdate({ id: updateId });
                      if (!res.ok) toast.error({ title: res.error });
                      else {
                        setIsPublished(false);
                        toast.success({ title: "Yayından alındı." });
                        router.refresh();
                      }
                    })
                  }
                >
                  Yayından kaldır
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  className={cn(adminBtnAccentClass, "w-full sm:w-auto")}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await publishClientProjectUpdate({ id: updateId });
                      if (!res.ok) toast.error({ title: res.error });
                      else {
                        setIsPublished(true);
                        toast.success({ title: "Yayınlandı ve bildirimler gönderildi." });
                        router.refresh();
                      }
                    })
                  }
                >
                  Yayınla &amp; Bildir
                </button>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "image/*";
                  fileRef.current.click();
                }
              }}
              className={cn(adminBtnSecondaryClass, "w-full")}
            >
              <ImageIcon className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
              Fotoğraf
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "video/mp4,video/webm,video/quicktime";
                  fileRef.current.click();
                }
              }}
              className={cn(adminBtnSecondaryClass, "w-full")}
            >
              <Video className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
              Video
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept =
                    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rar,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/x-rar-compressed,application/vnd.rar";
                  fileRef.current.click();
                }
              }}
              className={cn(adminBtnSecondaryClass, "w-full")}
            >
              <FileText className="h-4 w-4 text-[rgb(200,170,130)]" aria-hidden />
              Dosya
            </button>
          </div>

          <label
            className={cn(
              "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 px-3 py-3 text-sm text-[rgb(200,170,130)] transition-colors hover:border-[rgb(166,124,82)]/50",
              pending && "pointer-events-none opacity-50",
            )}
          >
            <Upload className="h-4 w-4" aria-hidden />
            Tüm türlerden seç (çoklu)
            <input
              ref={fileRef}
              type="file"
              multiple
              accept={PORTAL_ACCEPT_ATTR}
              className="hidden"
              onChange={onUpload}
              disabled={pending}
            />
          </label>

          {media.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-600">
              Henüz medya / dosya yok.
            </p>
          ) : (
            <div className="space-y-5">
              {images.length ? (
                <MediaSection title={`Görseller (${images.length})`}>
                  {images.map((m) => (
                    <MediaCard key={m.id} m={m} pending={pending} onDelete={deleteOne} />
                  ))}
                </MediaSection>
              ) : null}
              {videos.length ? (
                <MediaSection title={`Videolar (${videos.length})`}>
                  {videos.map((m) => (
                    <MediaCard key={m.id} m={m} pending={pending} onDelete={deleteOne} />
                  ))}
                </MediaSection>
              ) : null}
              {docs.length ? (
                <MediaSection title={`Dosyalar (${docs.length})`}>
                  {docs.map((m) => (
                    <MediaCard key={m.id} m={m} pending={pending} onDelete={deleteOne} />
                  ))}
                </MediaSection>
              ) : null}
            </div>
          )}
        </AdminSectionCard>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Medya eklemek için önce yukarıdan taslağı kaydedin.
        </p>
      )}
    </div>
  );
}

function MediaSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </div>
  );
}

function MediaCard({
  m,
  pending,
  onDelete,
}: {
  m: MediaRow;
  pending: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
      {m.mediaType === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.cloudinaryUrl} alt={m.caption ?? ""} className="aspect-[4/3] w-full object-cover" />
      ) : m.mediaType === "video" ? (
        <video src={m.cloudinaryUrl} controls className="aspect-video w-full bg-black" />
      ) : (
        <a
          href={withCloudinaryAttachment(m.cloudinaryUrl, mediaDownloadName(m))}
          download={mediaDownloadName(m)}
          target="_blank"
          rel="noreferrer"
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-zinc-900 px-3 text-center"
        >
          <FileText className="h-8 w-8 text-[rgb(200,170,130)]" aria-hidden />
          <span className="text-sm font-medium text-[rgb(200,170,130)] underline">
            {portalMediaKindLabel(m.mediaType)}
          </span>
          <span className="line-clamp-2 text-xs text-zinc-500">{m.caption || "Dosyayı aç"}</span>
        </a>
      )}
      <div className="flex items-center justify-between gap-2 px-2.5 py-2.5 text-xs">
        <span className="truncate text-zinc-500">{portalMediaKindLabel(m.mediaType)}</span>
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-9 shrink-0 items-center rounded-lg px-2.5 text-red-400 hover:bg-red-950/40 disabled:opacity-50"
          onClick={() => onDelete(m.id)}
        >
          Sil
        </button>
      </div>
    </li>
  );
}
