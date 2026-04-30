"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "@/lib/cn";

function plainToHtml(text: string) {
  const esc = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const lines = esc.split(/\r?\n/);
  return lines.map((l) => (l.trim().length ? `<p>${l}</p>` : "<p><br/></p>")).join("");
}

export function RichTextLite({
  value,
  onChangePlain,
  storageKey,
  className,
  invalid,
}: {
  value: string;
  onChangePlain: (next: string) => void;
  storageKey: string;
  className?: string;
  invalid?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  const initialHtml = useMemo(() => {
    if (typeof window === "undefined") return plainToHtml(value);
    const stored = window.localStorage.getItem(storageKey);
    return stored && stored.trim().length ? stored : plainToHtml(value);
  }, [storageKey, value]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!ready) {
      el.innerHTML = initialHtml;
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const commitPlain = () => {
    const el = editorRef.current;
    if (!el) return;
    const plain = (el.innerText || "").replace(/\n{3,}/g, "\n\n").trimEnd();
    onChangePlain(plain);
    try {
      window.localStorage.setItem(storageKey, el.innerHTML);
    } catch {
      /* ignore */
    }
  };

  const cmd = (name: string) => {
    // execCommand is deprecated but still supported; this is admin-only.
    document.execCommand(name);
    commitPlain();
  };

  return (
    <div className={cn("rounded-xl border bg-zinc-950/40", invalid ? "border-red-800/70" : "border-zinc-700", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-2 py-2">
        <button type="button" onClick={() => cmd("bold")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10" aria-label="Kalın">
          <Bold className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={() => cmd("italic")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10" aria-label="İtalik">
          <Italic className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={() => cmd("insertUnorderedList")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10" aria-label="Madde işaretli liste">
          <List className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={() => cmd("insertOrderedList")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10" aria-label="Numaralı liste">
          <ListOrdered className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" onClick={() => cmd("formatBlock")} className="hidden" aria-hidden />
        <button
          type="button"
          onClick={() => {
            document.execCommand("formatBlock", false, "blockquote");
            commitPlain();
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
          aria-label="Alıntı"
        >
          <Quote className="h-4 w-4" aria-hidden />
        </button>
        <div className="ml-auto flex items-center gap-2 px-2">
          <span className="text-[11px] font-medium text-zinc-500">Kaydedilen: düz metin</span>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={commitPlain}
        onBlur={commitPlain}
        className={cn(
          "min-h-[160px] w-full px-3 py-3 text-sm text-zinc-100 outline-none",
          // content styles (lightweight)
          "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l [&_blockquote]:border-white/15 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-300",
        )}
      />
    </div>
  );
}

