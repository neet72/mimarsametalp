"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { normalizeUsername } from "@/lib/security/username";
import { panelFieldClass } from "@/lib/portal/labels";
import { cn } from "@/lib/cn";

export function PanelLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("client-credentials", {
        username: normalizeUsername(username),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Kullanıcı adı veya şifre hatalı.");
        return;
      }
      router.replace("/panel");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-md space-y-6 rounded-2xl border border-border/80 bg-surface/90 p-8 shadow-[0_24px_80px_-40px_rgb(15_23_42/0.35)] backdrop-blur-md sm:p-10"
    >
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
          Samet Alp Mimarlık
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-primary">
          Müşteri paneli
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Proje durumunuz, güncellemeler ve istekleriniz için güvenli giriş.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Kullanıcı adı
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className={cn(panelFieldClass, "rounded-xl bg-white/70 py-3")}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Şifre
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={cn(panelFieldClass, "rounded-xl bg-white/70 py-3")}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>

      <p className="text-center text-xs text-muted">
        Hesabınız yoksa ofisimizle iletişime geçin.{" "}
        <Link href="/iletisim" className="text-accent underline-offset-2 hover:underline">
          İletişim
        </Link>
      </p>
    </form>
  );
}
