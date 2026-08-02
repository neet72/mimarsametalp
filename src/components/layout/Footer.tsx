"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/motion/FadeIn";
import { cn } from "@/lib/cn";
import { localeFromPathname, withLocalePath } from "@/lib/locale";
import { pageContainerClass } from "@/lib/page-layout";
import { OFFICE_ADDRESS_EN, OFFICE_ADDRESS_TR } from "@/content/kvkk-page";

const services =
  "Mimarlık, İç Mimarlık, Dekorasyon, Anahtar Teslim Proje, Mimari Danışmanlık, Yenileme ve Tadilat";

export function Footer() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = locale === "en";
  const year = new Date().getFullYear();
  const servicesText = t
    ? "Architecture, Interior Architecture, Decoration, Turnkey Projects, Architectural Consulting, Renovation & Remodeling"
    : services;
  const addressText = t ? OFFICE_ADDRESS_EN : OFFICE_ADDRESS_TR;
  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[max(0px,env(safe-area-inset-bottom,0px))]">
      <Reveal className={cn("relative py-10 sm:py-12", pageContainerClass)}>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="space-y-4">
            <p className="font-display text-lg font-semibold uppercase tracking-[0.14em] text-primary">
              Samet Alp Mimarlık
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted">{servicesText}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t ? "Location" : "Konum"}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{addressText}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t ? "Contact" : "İletişim"}
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="mailto:info@mimarsametalp.com"
                  title={t ? "Send email: info@mimarsametalp.com" : "E-posta gönder: info@mimarsametalp.com"}
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  info@mimarsametalp.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+905414267644"
                  title={t ? "Call: 0 (541) 426 76 44" : "Telefon ile ara: 0 (541) 426 76 44"}
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  0 (541) 426 76 44
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/905414267644?text=Merhaba%20Samet%20Alp%20Mimarl%C4%B1k%2C%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t ? "Message on WhatsApp" : "WhatsApp üzerinden yaz"}
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/samet-alp-714851232/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t ? "Open LinkedIn profile" : "LinkedIn profilini aç"}
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link
                  href="/panel/giris"
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  {t ? "Client portal" : "Müşteri paneli"}
                </Link>
              </li>
              <li>
                <Link
                  href={withLocalePath("/kvkk", locale)}
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  {t ? "Privacy / KVKK" : "KVKK / Gizlilik"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pointer-events-none mt-10 h-6 w-full opacity-[0.35]"
          aria-hidden
        >
          <svg
            viewBox="0 0 1200 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full text-border"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20C200 4 400 36 600 20C800 4 1000 36 1200 20"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center">
          <p className="text-xs tracking-wide text-muted">
            © {year} Samet Alp Mimarlık. {t ? "All rights reserved." : "Tüm hakları saklıdır."}
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
