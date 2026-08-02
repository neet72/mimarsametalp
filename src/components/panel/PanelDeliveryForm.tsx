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
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await submitDeliveryRequest({
        projectId: String(fd.get("projectId") ?? ""),
        fullName: String(fd.get("fullName") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        message: String(fd.get("message") ?? ""),
        address: String(fd.get("address") ?? ""),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMsg("İsteğiniz alındı. En kısa sürede dönüş yapacağız.");
      form.reset();
      router.refresh();
    });
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white/50 px-6 py-12 text-center">
        <p className="font-display text-lg font-semibold text-primary">Proje atanmamış</p>
        <p className="mt-2 text-sm text-muted">
          İstek göndermek için size atanmış bir portal projesi gerekir. Ofisle iletişime geçin.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border bg-white/50 p-6 sm:p-8">
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
        <span className="mb-1 block text-muted">Konu</span>
        <input
          name="subject"
          required
          placeholder="Örn. Malzeme seçimi, randevu, değişiklik talebi"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Mesaj / isteğiniz</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="İsteğinizi veya sorunuzu yazın…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Adres (opsiyonel)</span>
        <textarea
          name="address"
          rows={2}
          placeholder="Gerekirse adres veya konum notu"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Gönder
      </button>
    </form>
  );
}
