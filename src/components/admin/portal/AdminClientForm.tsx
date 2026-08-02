"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createClientUser,
  resetClientPassword,
  updateClientUser,
} from "@/actions/admin/clients";
import { useAdminToast } from "@/components/admin/ui/toast";

type ProjectOption = { id: string; title: string };
type ClientRow = {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  notifyEmail: boolean;
  notifySms: boolean;
  active: boolean;
  projectIds: string[];
};

export function AdminClientForm({
  mode,
  initial,
  projects,
}: {
  mode: "create" | "edit";
  initial?: ClientRow;
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(initial?.projectIds ?? []);

  function toggleProject(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createClientUser({
          fullName: String(fd.get("fullName") ?? ""),
          username: String(fd.get("username") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          notifyEmail: fd.get("notifyEmail") === "on",
          notifySms: fd.get("notifySms") === "on",
          projectIds: selected,
        });
        if (!res.ok) {
          toast.error({ title: res.error });
          return;
        }
        setTempPassword(res.data?.tempPassword ?? null);
        toast.success({ title: "Müşteri oluşturuldu." });
        router.refresh();
        return;
      }

      if (!initial) return;
      const res = await updateClientUser({
        id: initial.id,
        fullName: String(fd.get("fullName") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        notifyEmail: fd.get("notifyEmail") === "on",
        notifySms: fd.get("notifySms") === "on",
        active: fd.get("active") === "on",
        projectIds: selected,
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      toast.success({ title: "Kaydedildi." });
      router.refresh();
    });
  }

  function onReset() {
    if (!initial) return;
    startTransition(async () => {
      const res = await resetClientPassword({ id: initial.id });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      setTempPassword(res.data?.tempPassword ?? null);
      toast.success({ title: "Şifre sıfırlandı." });
    });
  }

  return (
    <div className="space-y-4">
      {tempPassword ? (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Geçici şifre:{" "}
          <code className="select-all font-mono text-base">{tempPassword}</code>
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => void navigator.clipboard.writeText(tempPassword)}
          >
            Kopyala
          </button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Ad soyad</span>
          <input
            name="fullName"
            required
            defaultValue={initial?.fullName}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
          />
        </label>
        {mode === "create" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-zinc-500">Kullanıcı adı</span>
            <input
              name="username"
              required
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
            />
          </label>
        ) : (
          <p className="text-sm text-zinc-500">
            Kullanıcı adı: <span className="text-zinc-200">{initial?.username}</span>
          </p>
        )}
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">E-posta</span>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Telefon</span>
          <input
            name="phone"
            defaultValue={initial?.phone ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
          />
        </label>

        <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
          <label className="inline-flex items-center gap-2">
            <input name="notifyEmail" type="checkbox" defaultChecked={initial?.notifyEmail ?? true} />
            E-posta bildirimi
          </label>
          <label className="inline-flex items-center gap-2">
            <input name="notifySms" type="checkbox" defaultChecked={initial?.notifySms ?? true} />
            SMS bildirimi
          </label>
          {mode === "edit" ? (
            <label className="inline-flex items-center gap-2">
              <input name="active" type="checkbox" defaultChecked={initial?.active ?? true} />
              Aktif
            </label>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm text-zinc-500">Projeler</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {projects.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleProject(p.id)}
                />
                {p.title}
              </label>
            ))}
            {projects.length === 0 ? (
              <p className="text-sm text-zinc-600">Önce müşteri projesi oluşturun.</p>
            ) : null}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            {mode === "create" ? "Oluştur" : "Kaydet"}
          </button>
          {mode === "edit" ? (
            <button
              type="button"
              disabled={pending}
              onClick={onReset}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200"
            >
              Şifre sıfırla
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
