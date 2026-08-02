"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitDeliveryRequest } from "@/actions/client/panel";

export function PanelDeliveryForm({
  projects,
  defaults,
}: {
  projects: { id: string; title: string }[];
  defaults: { fullName: string; phone: string };
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
      const res = await submitDeliveryRequest({
        projectId: String(fd.get("projectId") ?? ""),
        fullName: String(fd.get("fullName") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        address: String(fd.get("address") ?? ""),
        notes: String(fd.get("notes") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMsg("Talebiniz alındı. En kısa sürede dönüş yapacağız.");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  if (projects.length === 0) {
    return <p className="text-muted">Teslim talebi için atanmış bir proje gerekli.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-5 rounded-2xl border border-border bg-white/50 p-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {msg ? <p className="text-sm text-accent">{msg}</p> : null}
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Proje</span>
        <select name="projectId" required className="w-full rounded-lg border border-border bg-surface px-3 py-2.5">
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Ad soyad</span>
        <input
          name="fullName"
          required
          defaultValue={defaults.fullName}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Telefon</span>
        <input
          name="phone"
          required
          defaultValue={defaults.phone}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Teslim adresi</span>
        <textarea
          name="address"
          required
          rows={3}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Not (opsiyonel)</span>
        <textarea name="notes" rows={2} className="w-full rounded-lg border border-border bg-surface px-3 py-2.5" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Gönder
      </button>
    </form>
  );
}
