"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-posta veya şifre hatalı.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl backdrop-blur-sm"
    >
      <div>
        <h1 className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(166,124,82)]">
          Yönetici
        </h1>
        <p className="mt-2 text-lg font-medium text-zinc-100">Giriş</p>
      </div>
      {error ? (
        <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          E-posta
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[rgb(166,124,82)] focus:ring-1 focus:ring-[rgb(166,124,82)]/40"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
          Şifre
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[rgb(166,124,82)] focus:ring-1 focus:ring-[rgb(166,124,82)]/40"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[rgb(166,124,82)] py-3 text-sm font-semibold uppercase tracking-wider text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Giriş…" : "Devam"}
      </button>
    </form>
  );
}
