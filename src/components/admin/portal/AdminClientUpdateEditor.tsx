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
        toast.success({ title: "Taslak oluşturuldu." });
        router.replace(`/admin/client-projects/${projectId}/updates?id=${res.data?.id}`);
        router.refresh();
        return;
      }
      const res = await updateClientProjectUpdate({ id: updateId, ...payload });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Kaydedildi." });
      router.refresh();
    });
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !updateId) {
      toast.error({ title: "Önce taslağı kaydedin." });
      return;
    }
    startTransition(async () => {
      const res = await uploadClientUpdateMedia({ updateId, file, caption: "" });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
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
      toast.success({ title: "Yüklendi." });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Başlık</span>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Aşama (opsiyonel)</span>
          <select
            name="stageId"
            defaultValue={initial?.stageId ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3"
          >
            <option value="">—</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">İçerik (Markdown)</span>
          <textarea
            name="body"
            required
            rows={12}
            defaultValue={initial?.body}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Kaydet
        </button>
      </form>

      {updateId ? (
        <div className="space-y-4 rounded-xl border border-zinc-800 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-zinc-400">
              Medya yükle
              <input type="file" accept="image/*,video/*,application/pdf" className="mt-1 block" onChange={onUpload} />
            </label>
            {initial?.isPublished ? (
              <button
                type="button"
                disabled={pending}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
                onClick={() =>
                  startTransition(async () => {
                    const res = await unpublishClientProjectUpdate({ id: updateId });
                    if (!res.ok) toast.error({ title: res.error });
                    else {
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
          <ul className="grid gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <li key={m.id} className="rounded-lg border border-zinc-800 p-2 text-xs">
                <a href={m.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-[rgb(166,124,82)] underline">
                  {m.mediaType}
                </a>
                <button
                  type="button"
                  className="ml-2 text-red-400"
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
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
