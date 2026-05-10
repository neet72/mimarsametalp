"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { logger } from "@/lib/observability/logger";

function subscribePathLang(_onStoreChange: () => void) {
  // Global error ekranında route değişimi nadir; popstate ile güncellemek yeterli.
  window.addEventListener("popstate", _onStoreChange);
  return () => window.removeEventListener("popstate", _onStoreChange);
}

function getPathLang(): "en" | "tr" {
  if (typeof window === "undefined") return "tr";
  const p = window.location.pathname;
  return p === "/en" || p.startsWith("/en/") ? "en" : "tr";
}

function usePathHtmlLang(): "en" | "tr" {
  return useSyncExternalStore(subscribePathLang, getPathLang, () => "tr");
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = usePathHtmlLang();
  const copy =
    lang === "en"
      ? {
          title: "Unexpected error",
          body: "Something went wrong at the application level. Please try again.",
          retry: "Try again",
          home: "Back to home",
        }
      : {
          title: "Beklenmedik hata",
          body: "Uygulama seviyesinde bir hata oluştu. Lütfen tekrar deneyin.",
          retry: "Tekrar dene",
          home: "Ana sayfaya dön",
        };

  useEffect(() => {
    logger.error({
      msg: "global error boundary",
      scope: "app.global-error",
      digest: error.digest,
      error: { name: error.name, message: error.message, stack: error.stack },
    });
  }, [error]);

  const homeHref = lang === "en" ? "/en" : "/";

  return (
    <html lang={lang === "en" ? "en" : "tr"} suppressHydrationWarning>
      <body className="bg-surface text-primary">
        <div className="mx-auto w-full max-w-2xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h1 className="font-display text-xl font-semibold">{copy.title}</h1>
            <p className="mt-2 text-sm text-muted">{copy.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {copy.retry}
              </button>
              <Link
                href={homeHref}
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {copy.home}
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

