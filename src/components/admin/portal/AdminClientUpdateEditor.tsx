"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createClientProjectUpdate,
  deleteClientUpdateMedia,
  publishClientProjectUpdate,
  unpublishClientProjectUpdate,
  updateClientProjectUpdate,
  uploadClientUpdateMedia,
} from "@/actions/admin/client-updates";
import { useAdminToast } from "@/components/admin/ui/toast";

type StageOpt = { id: string; name: string };
type MediaRow = { id: string; cloudinaryUrl: string; mediaType: string; caption: string | null };

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
    media: MediaRow[];
  };
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [updateId, setUpdateId] = useState(initial?.id ?? "");
  const [media, setMedia] = useState(initial?.media ?? []);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const payload = {
        title: String(fd.get("title") ?? ""),
        body: String(fd.get("body") ?? ""),
        stageId: String(fd.get("stageId") || "") || null,
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
      toast.error({ title: "Önce raporu kaydedin, sonra medya ekleyin." });
      e.target.value = "";
      return;
    }
    startTransition(async () => {
      for (const file of files) {
        const res = await uploadClientUpdateMedia({ updateId, file, caption: "" });
        if (!res.ok) {
          toast.error({ title: `${file.name}: ${res.error}` });
          continue;
        }
        if (res.data) {
          setMedia((m) => [
            ...m,
            {
              id: res.data!.id,
              cloudinaryUrl: res.data!.url,
              mediaType: res.data!.mediaType,
              caption: null,
            },
          ]);
        }
      }
      toast.success({ title: "Medya yüklendi." });
      router.refresh();
      e.target.value = "";
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-4 py-3 text-sm text-zinc-400">
        <p className="font-medium text-zinc-200">Saha raporu / güncelleme</p>
        <p className="mt-1">
          Markdown ile detaylı rapor yazın; görsel, video veya PDF ekleyin. Yayınlayınca müşteri paneline düşer ve
          bildirim gider.
        </p>
      </div>

      <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Rapor başlığı</span>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            placeholder="Örn. 12. hafta şantiye raporu"
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">İlgili aşama</span>
          <select
            name="stageId"
            defaultValue={initial?.stageId ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          >
            <option value="">— Genel / aşamasız —</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Rapor metni (Markdown)</span>
          <textarea
            name="body"
            required
            rows={14}
            defaultValue={initial?.body}
            placeholder={"## Özet\nBu hafta...\n\n- Madde 1\n- Madde 2"}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm leading-relaxed"
          />
          <span className="mt-1 block text-xs text-zinc-600">
            ## başlık, **kalın**, - liste, [link](https://…) desteklenir.
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950"
        >
          {updateId ? "Raporu kaydet" : "Taslak oluştur"}
        </button>
      </form>

      {updateId ? (
        <div className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">Medya galerisi</p>
              <p className="mt-1 text-xs text-zinc-500">Görsel, video (mp4/webm) veya PDF — birden fazla seçebilirsiniz.</p>
              <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-zinc-700 px-3 py-2 text-sm text-[rgb(200,170,130)]">
                Dosya ekle
                <input
                  type="file"
                  multiple
                  accept="image/*,video/mp4,video/webm,application/pdf"
                  className="hidden"
                  onChange={onUpload}
                  disabled={pending}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {isPublished ? (
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
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
                  className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2 text-sm font-semibold text-zinc-950"
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
          </div>

          {media.length === 0 ? (
            <p className="text-sm text-zinc-600">Henüz medya yok.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((m) => (
                <li key={m.id} className="overflow-hidden rounded-lg border border-zinc-800">
                  {m.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.cloudinaryUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                  ) : m.mediaType === "video" ? (
                    <video src={m.cloudinaryUrl} controls className="aspect-video w-full bg-black" />
                  ) : (
                    <a
                      href={m.cloudinaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex aspect-[4/3] items-center justify-center bg-zinc-900 text-sm text-[rgb(200,170,130)] underline"
                    >
                      PDF / dosya
                    </a>
                  )}
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                    <span className="text-zinc-500">{m.mediaType}</span>
                    <button
                      type="button"
                      className="text-red-400"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteClientUpdateMedia({ id: m.id });
                          if (!res.ok) toast.error({ title: res.error });
                          else {
                            setMedia((list) => list.filter((x) => x.id !== m.id));
                            router.refresh();
                          }
                        })
                      }
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
