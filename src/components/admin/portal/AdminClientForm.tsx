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
  adminVisiblePassword: string | null;
  lastLoginAt: string | null;
  notifyEmail: boolean;
  notifySms: boolean;
  active: boolean;
  projectIds: string[];
};

function fieldErrorText(fe: Record<string, string[] | undefined> | undefined) {
  if (!fe) return null;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(fe)) {
    if (v?.[0]) parts.push(`${k}: ${v[0]}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

function CopyLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-zinc-500">{label}</span>
      <code className="select-all font-mono text-amber-100">{value}</code>
      <button
        type="button"
        className="text-xs text-zinc-400 underline hover:text-zinc-200"
        onClick={() => void navigator.clipboard.writeText(value)}
      >
        Kopyala
      </button>
    </div>
  );
}

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
  const [shownPassword, setShownPassword] = useState<string | null>(
    initial?.adminVisiblePassword ?? null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(initial?.projectIds ?? []);

  function toggleProject(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createClientUser({
          fullName: String(fd.get("fullName") ?? ""),
          username: String(fd.get("username") ?? ""),
          password: String(fd.get("password") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          notifyEmail: fd.get("notifyEmail") === "on",
          notifySms: fd.get("notifySms") === "on",
          projectIds: selected,
        });
        if (!res.ok) {
          const detail = fieldErrorText(
            "fieldErrors" in res ? (res.fieldErrors as Record<string, string[] | undefined>) : undefined,
          );
          const msg = detail ? `${res.error} (${detail})` : res.error;
          setFormError(msg);
          toast.error({ title: msg });
          return;
        }
        setShownPassword(res.data?.tempPassword ?? null);
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
        password: String(fd.get("password") ?? ""),
        notifyEmail: fd.get("notifyEmail") === "on",
        notifySms: fd.get("notifySms") === "on",
        active: fd.get("active") === "on",
        projectIds: selected,
      });
      if (!res.ok) {
        const detail = fieldErrorText(
          "fieldErrors" in res ? (res.fieldErrors as Record<string, string[] | undefined>) : undefined,
        );
        const msg = detail ? `${res.error} (${detail})` : res.error;
        setFormError(msg);
        toast.error({ title: msg });
        return;
      }
      if (res.data?.tempPassword) setShownPassword(res.data.tempPassword);
      toast.success({ title: "Kaydedildi." });
      router.refresh();
    });
  }

  function onReset() {
    if (!initial) return;
    const custom = window.prompt(
      "Yeni şifreyi yazın (boş bırakırsanız rastgele üretilir):",
      shownPassword ?? "",
    );
    if (custom === null) return;
    startTransition(async () => {
      const res = await resetClientPassword({
        id: initial.id,
        password: custom.trim(),
      });
      if (!res.ok) {
        toast.error({ title: res.error });
        return;
      }
      setShownPassword(res.data?.tempPassword ?? null);
      toast.success({ title: "Şifre güncellendi." });
      router.refresh();
    });
  }

  const loginLabel = initial?.lastLoginAt
    ? new Date(initial.lastLoginAt).toLocaleString("tr-TR")
    : null;

  return (
    <div className="space-y-4">
      {mode === "edit" ? (
        <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/40 px-4 py-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Portal özeti</p>
          <p className="text-zinc-300">
            Giriş:{" "}
            {loginLabel ? (
              <span className="text-emerald-300">Evet — son {loginLabel}</span>
            ) : (
              <span className="text-amber-200">Henüz giriş yapmadı</span>
            )}
          </p>
          <p className="text-zinc-300">
            E-posta:{" "}
            <span className="text-zinc-100">{initial?.email || "—"}</span>
            <span className="text-zinc-600"> (müşteri tercihlerden güncelleyebilir)</span>
          </p>
          <p className="text-zinc-300">
            Telefon:{" "}
            <span className="text-zinc-100">{initial?.phone || "—"}</span>
          </p>
          {shownPassword ? (
            <CopyLine label="Portal şifresi:" value={shownPassword} />
          ) : (
            <p className="text-zinc-500">Kayıtlı şifre yok — aşağıdan belirleyin veya sıfırlayın.</p>
          )}
        </div>
      ) : shownPassword ? (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          <CopyLine label="Portal şifresi:" value={shownPassword} />
        </div>
      ) : null}

      {formError ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {formError}
        </p>
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
              autoComplete="off"
              placeholder="ornek.musteri"
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
            />
            <span className="mt-1 block text-xs text-zinc-600">
              Türkçe harfler otomatik dönüşür (bünyamin → bunyamin). E-posta yazmayın.
            </span>
          </label>
        ) : (
          <p className="text-sm text-zinc-500">
            Kullanıcı adı: <span className="text-zinc-200">{initial?.username}</span>
          </p>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">
            {mode === "create" ? "Portal şifresi" : "Yeni portal şifresi (opsiyonel)"}
          </span>
          <input
            name="password"
            type="text"
            required={mode === "create"}
            minLength={mode === "create" ? 6 : undefined}
            autoComplete="new-password"
            placeholder={mode === "create" ? "Sizin belirlediğiniz şifre" : "Boş bırakırsanız değişmez"}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 font-mono text-zinc-100"
          />
          <span className="mt-1 block text-xs text-zinc-600">
            Buraya yazdığınız şifre adminde görünür kalır; müşteri değiştirirse yeni hali de burada güncellenir.
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">E-posta (bildirim / müşteri tercihi)</span>
          <input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-zinc-100"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-500">Telefon (müşteri tercihi)</span>
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
          <legend className="mb-2 text-sm text-zinc-500">Portal projeleri</legend>
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
              <p className="text-sm text-zinc-600">Önce portal projesi oluşturun (opsiyonel).</p>
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
              Şifre belirle / sıfırla
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
