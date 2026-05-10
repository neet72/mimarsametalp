"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = { variant?: "full" | "embed" };

const steps = [
  {
    title: "Başlığı yazın",
    body: "Başlık, sitede görünen isimdir. Slug (adres) çoğu zaman kendiliğinden oluşur; gerekirse «Başlıktan üret» ile düzeltebilirsiniz.",
  },
  {
    title: "Yayında mı, taslak mı?",
    body: "«Yayında» işaretliyse hizmet ziyaretçilere açılır ve listede yer alır. Taslaksanız yalnızca bu yönetim panelinde kalır; üzerinde çalışmaya devam edebilirsiniz.",
  },
  {
    title: "Kapak görseli",
    body: "«Yükle» ile bilgisayarınızdan fotoğraf seçin; adres otomatik yazılır. İsterseniz hazır bir görsel bağlantısını da yapıştırabilirsiniz.",
  },
  {
    title: "Sıra numarası",
    body: "Küçük sayı, hizmetler listesinde daha üstte demektir. Aynı sayıyı verirseniz sistem tarihe göre dizer.",
  },
  {
    title: "Detaylar (isteğe bağlı)",
    body: "«Detay içerik» bölümündeki kapsam, süreç ve SSS alanları zorunlu değildir. Boş bırakılabilir veya site varsayılanlarıyla desteklenir.",
  },
];

export function ServiceAdminGuide({ variant = "full" }: Props) {
  const [open, setOpen] = useState(true);

  if (variant === "embed") {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-sm leading-relaxed text-zinc-400">
        <p className="font-medium text-zinc-200">Hızlı hatırlatma</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 marker:text-zinc-500">
          <li>Başlık → slug çoğu zaman otomatik gelir.</li>
          <li>«Yayında» işaretli değilse ziyaretçi görmez.</li>
          <li>Kaydet → listeye dönersiniz; oradan sitede önizleme açabilirsiniz.</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[rgb(166,124,82)]/25 bg-[rgb(166,124,82)]/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgb(166,124,82)]/10"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <BookOpen className="h-4 w-4 shrink-0 text-[rgb(200,170,130)]" aria-hidden />
          Hizmet eklerken bunları bilin
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-zinc-400 transition-transform", open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-zinc-800/80 px-4 pb-4 pt-2">
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 text-sm">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-zinc-200">{s.title}</p>
                  <p className="mt-1 leading-relaxed text-zinc-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs text-zinc-600">
            Takılırsanız önce taslak kaydedin; sonra «Hizmetler» listesinden düzenleyerek yayına alın.{" "}
            <Link href="/admin/services" className="font-medium text-[rgb(200,170,130)] underline-offset-2 hover:underline">
              Listeye git
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
