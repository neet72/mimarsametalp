"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeClientPassword, updateClientPreferences } from "@/actions/client/panel";

export function PanelPreferencesForm({
  initial,
}: {
  initial: {
    email: string;
    phone: string;
    notifyEmail: boolean;
    notifySms: boolean;
  };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateClientPreferences({
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        notifyEmail: fd.get("notifyEmail") === "on",
        notifySms: fd.get("notifySms") === "on",
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMsg("Tercihler kaydedildi.");
      router.refresh();
    });
  }

  function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startPwTransition(async () => {
      const res = await changeClientPassword({
        currentPassword: String(fd.get("currentPassword") ?? ""),
        newPassword: String(fd.get("newPassword") ?? ""),
      });
      if (!res.ok) {
        setPwError(res.error);
        return;
      }
      setPwMsg("Şifre güncellendi.");
      form.reset();
      router.refresh();
    });
  }

  return (
    <div className="grid max-w-3xl gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-white/50 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary">İletişim</h2>
          <p className="mt-1 text-sm text-muted">Bildirim tercihleri.</p>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {msg ? <p className="text-sm text-accent">{msg}</p> : null}
        <label className="block text-sm">
          <span className="mb-1 block text-muted">E-posta</span>
          <input
            name="email"
            type="email"
            defaultValue={initial.email}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Telefon</span>
          <input
            name="phone"
            defaultValue={initial.phone}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="notifyEmail" type="checkbox" defaultChecked={initial.notifyEmail} />
          E-posta bildirimi
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="notifySms" type="checkbox" defaultChecked={initial.notifySms} />
          SMS bildirimi (yakında)
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Kaydet
        </button>
      </form>

      <form onSubmit={onPassword} className="space-y-5 rounded-2xl border border-border bg-white/50 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary">Şifre değiştir</h2>
          <p className="mt-1 text-sm text-muted">İsterseniz güncelleyin — zorunlu değil.</p>
        </div>
        {pwError ? <p className="text-sm text-red-600">{pwError}</p> : null}
        {pwMsg ? <p className="text-sm text-accent">{pwMsg}</p> : null}
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Mevcut şifre</span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Yeni şifre (en az 8 karakter)</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
          />
        </label>
        <button
          type="submit"
          disabled={pwPending}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-accent/40 disabled:opacity-50"
        >
          Şifreyi güncelle
        </button>
      </form>
    </div>
  );
}
