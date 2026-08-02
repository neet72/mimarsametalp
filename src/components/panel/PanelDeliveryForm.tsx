"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitDeliveryRequest } from "@/actions/client/panel";
import { panelCardClass, panelFieldClass } from "@/lib/portal/labels";
import { cn } from "@/lib/cn";

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
      <div className={cn(panelCardClass, "mx-auto max-w-xl px-6 py-12 text-center")}>
        <p className="font-display text-lg font-semibold text-primary">Proje atanmamış</p>
        <p className="mt-2 text-sm text-muted">
          İstek göndermek için size atanmış bir portal projesi gerekir. Ofisle iletişime geçin.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn(panelCardClass, "mx-auto max-w-xl space-y-5")}>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {msg ? <p className="text-sm text-accent">{msg}</p> : null}
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Proje</span>
        <select name="projectId" required className={panelFieldClass}>
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
          className={panelFieldClass}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Mesaj / isteğiniz</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="İsteğinizi veya sorunuzu yazın…"
          className={panelFieldClass}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Ad soyad</span>
          <input
            name="fullName"
            required
            defaultValue={defaults.fullName}
            className={panelFieldClass}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Telefon</span>
          <input
            name="phone"
            required
            defaultValue={defaults.phone}
            className={panelFieldClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-muted">Adres (opsiyonel)</span>
        <textarea
          name="address"
          rows={2}
          placeholder="Gerekirse adres veya konum notu"
          className={panelFieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        Gönder
      </button>
    </form>
  );
}
