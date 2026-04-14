"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { upsertSiteContent } from "@/actions/admin/site-content";

type Locale = "tr" | "en";

type Step = { title: string; body: string };

type ContactDraft = {
  pageTitle: string;
  intro: string;
  stepsHeading: string;
  steps: Step[];
  closing: string;
  email: string;
  phoneDisplay: string;
  phoneTel: string;
  instagram: string;
  whatsapp: string;
  linkedin: string;
};

const emptyDraft: ContactDraft = {
  pageTitle: "",
  intro: "",
  stepsHeading: "",
  steps: [{ title: "", body: "" }],
  closing: "",
  email: "",
  phoneDisplay: "",
  phoneTel: "",
  instagram: "",
  whatsapp: "",
  linkedin: "",
};

export function ContactAdminPanel({
  initialTr,
  initialEn,
}: {
  initialTr?: string | null;
  initialEn?: string | null;
}) {
  const [tab, setTab] = useState<Locale>("tr");
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const initial = useMemo(() => {
    const parse = (s?: string | null) => {
      if (!s) return emptyDraft;
      try {
        const j = JSON.parse(s) as Partial<ContactDraft>;
        const steps = Array.isArray(j.steps) ? (j.steps as Step[]) : emptyDraft.steps;
        return { ...emptyDraft, ...j, steps: steps.length ? steps : emptyDraft.steps };
      } catch {
        return emptyDraft;
      }
    };
    return { tr: parse(initialTr), en: parse(initialEn) } as const;
  }, [initialEn, initialTr]);

  const [draftTr, setDraftTr] = useState<ContactDraft>(initial.tr);
  const [draftEn, setDraftEn] = useState<ContactDraft>(initial.en);
  const draft = tab === "tr" ? draftTr : draftEn;
  const setDraft = tab === "tr" ? setDraftTr : setDraftEn;

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-100">
            İletişim Paneli (Yeni)
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mevcut sayfayı değiştirmez; sadece içerik kaydı yapar. Sonra bağlarız.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("tr")}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === "tr" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            TR
          </button>
          <button
            type="button"
            onClick={() => setTab("en")}
            className={`rounded-lg px-3 py-2 text-sm ${
              tab === "en" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <form
        action={(fd) => {
          setOk(null);
          setErr(null);
          startTransition(async () => {
            fd.set("key", "contact");
            fd.set("locale", tab);
            fd.set("data", JSON.stringify(draft));
            const res = await upsertSiteContent(fd);
            if (res.ok) setOk("Kaydedildi.");
            else setErr(res.error ?? "Hata.");
          });
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-7">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Metinler
            </h3>
            <div className="mt-3 grid gap-3">
              <input
                value={draft.pageTitle}
                onChange={(e) => setDraft((v) => ({ ...v, pageTitle: e.target.value }))}
                placeholder="Sayfa Başlığı"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <textarea
                value={draft.intro}
                onChange={(e) => setDraft((v) => ({ ...v, intro: e.target.value }))}
                placeholder="Giriş"
                rows={5}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={draft.stepsHeading}
                onChange={(e) => setDraft((v) => ({ ...v, stepsHeading: e.target.value }))}
                placeholder="Adımlar Başlığı"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <textarea
                value={draft.closing}
                onChange={(e) => setDraft((v) => ({ ...v, closing: e.target.value }))}
                placeholder="Kapanış"
                rows={3}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              İletişim Bilgileri
            </h3>
            <div className="mt-3 grid gap-3">
              <input
                value={draft.email}
                onChange={(e) => setDraft((v) => ({ ...v, email: e.target.value }))}
                placeholder="E-posta"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={draft.phoneDisplay}
                onChange={(e) => setDraft((v) => ({ ...v, phoneDisplay: e.target.value }))}
                placeholder="Telefon (Görünen)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <input
                value={draft.phoneTel}
                onChange={(e) => setDraft((v) => ({ ...v, phoneTel: e.target.value }))}
                placeholder="Telefon (tel:+90...)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={draft.instagram}
                  onChange={(e) => setDraft((v) => ({ ...v, instagram: e.target.value }))}
                  placeholder="Instagram URL"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                <input
                  value={draft.whatsapp}
                  onChange={(e) => setDraft((v) => ({ ...v, whatsapp: e.target.value }))}
                  placeholder="WhatsApp URL"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                <input
                  value={draft.linkedin}
                  onChange={(e) => setDraft((v) => ({ ...v, linkedin: e.target.value }))}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 lg:col-span-12">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Adımlar (Timeline)
              </h3>
              <button
                type="button"
                onClick={() => setDraft((v) => ({ ...v, steps: [...v.steps, { title: "", body: "" }] }))}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Adım Ekle
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {draft.steps.map((s, idx) => (
                <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Step {String(idx + 1).padStart(2, "0")}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((v) => ({ ...v, steps: v.steps.filter((_, i) => i !== idx) || [] }))
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                      aria-label="Sil"
                      disabled={draft.steps.length === 1}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <input
                    value={s.title}
                    onChange={(e) =>
                      setDraft((v) => {
                        const next = [...v.steps];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return { ...v, steps: next };
                      })
                    }
                    placeholder="Başlık"
                    className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                  <textarea
                    value={s.body}
                    onChange={(e) =>
                      setDraft((v) => {
                        const next = [...v.steps];
                        next[idx] = { ...next[idx], body: e.target.value };
                        return { ...v, steps: next };
                      })
                    }
                    placeholder="Açıklama"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            {ok ? <p className="text-xs text-emerald-400">{ok}</p> : null}
            {err ? <p className="text-xs text-red-400">{err}</p> : null}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgb(166,124,82)] px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

