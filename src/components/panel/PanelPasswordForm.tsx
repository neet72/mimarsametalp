"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { changeClientPassword } from "@/actions/client/panel";

export function PanelPasswordForm({ forced }: { forced?: boolean }) {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await changeClientPassword({
        currentPassword: String(fd.get("currentPassword") ?? ""),
        newPassword: String(fd.get("newPassword") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      await update({ mustChangePassword: false });
      router.replace("/panel");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-border bg-white/50 p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-primary">Şifre değiştir</h1>
        {forced ? (
          <p className="mt-2 text-sm text-muted">İlk girişte güvenli bir şifre belirlemeniz gerekiyor.</p>
        ) : null}
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Mevcut şifre</span>
        <input
          name="currentPassword"
          type="password"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Yeni şifre</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        Kaydet
      </button>
    </form>
  );
}
