import { cn } from "@/lib/cn";
import { pageContainerClass } from "@/lib/page-layout";

const services =
  "Mimarlık, İç Mimarlık, Dekorasyon, Anahtar Teslim Proje, Mimari Danışmanlık, Yenileme ve Tadilat";

const address =
  "Güzelevler Mahallesi 2067/2 Sokak A blok No: 32/2 Adana / Türkiye";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[max(0px,env(safe-area-inset-bottom,0px))]">
      <div className={cn("relative py-10 sm:py-12", pageContainerClass)}>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="space-y-4">
            <p className="font-display text-lg font-semibold uppercase tracking-[0.14em] text-primary">
              Samet Alp Mimarlık
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted">{services}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Konum
            </h2>
            <p className="text-sm leading-relaxed text-muted">{address}</p>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              İletişim
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="mailto:info@mimarsametalp.com"
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  info@mimarsametalp.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+905414267644"
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
                  className="touch-manipulation inline-flex min-h-[44px] items-center py-1 font-medium transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-0"
                >
                  LinkedIn
                </a>
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
            © {year} Samet Alp Mimarlık. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
