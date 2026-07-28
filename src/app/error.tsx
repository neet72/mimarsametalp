"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logger } from "@/lib/observability/logger";
import { localeFromPathname } from "@/lib/locale";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isEn = localeFromPathname(pathname) === "en";

  useEffect(() => {
    logger.error({
      msg: "app error boundary",
      scope: "app.error",
      digest: error.digest,
      error: { name: error.name, message: error.message, stack: error.stack },
    });
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="font-display text-xl font-semibold text-primary">
          {isEn ? "Something went wrong" : "Bir şeyler ters gitti"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isEn
            ? "An unexpected error occurred while loading this page. Please try again."
            : "Sayfa yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isEn ? "Try again" : "Tekrar dene"}
          </button>
          <Link
            href={isEn ? "/en" : "/"}
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-muted/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isEn ? "Back to home" : "Ana sayfaya dön"}
          </Link>
        </div>
      </div>
    </div>
  );
}
