"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateClientPreferences } from "@/actions/client/panel";

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
  const [pending, startTransition] = useTransition();

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

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-5 rounded-2xl border border-border bg-white/50 p-6">
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
  );
}
