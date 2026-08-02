"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
        username,
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
      className="mx-auto w-full max-w-sm space-y-5 rounded-2xl border border-border bg-white/60 p-8 shadow-sm"
    >
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
          Samet Alp Mimarlık
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-primary">
          Müşteri girişi
        </h1>
        <p className="mt-1 text-sm text-muted">Proje panelinize erişin.</p>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Kullanıcı adı
        </span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">Şifre</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Giriş…" : "Giriş yap"}
      </button>
    </form>
  );
}
