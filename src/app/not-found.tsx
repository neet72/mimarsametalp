import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center sm:py-28">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-muted">
        {isEn ? "404" : "404"}
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
        {isEn ? "Page not found" : "Sayfa bulunamadı"}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
        {isEn
          ? "The page you’re looking for doesn’t exist or may have moved."
          : "Aradığınız sayfa yok veya taşınmış olabilir."}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={isEn ? "/en" : "/"}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-7 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-surface transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isEn ? "Home" : "Ana sayfa"}
        </Link>
        <Link
          href={isEn ? "/en/projeler" : "/projeler"}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-transparent px-7 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-primary transition hover:border-primary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isEn ? "Projects" : "Projeler"}
        </Link>
      </div>
    </div>
  );
}
