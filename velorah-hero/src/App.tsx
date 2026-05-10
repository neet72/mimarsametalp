import { Button } from "@/components/ui/button";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

type NavLink = { label: string; href: string; active?: boolean };

const navLinks: NavLink[] = [
  { label: "Home", href: "#", active: true },
  { label: "Studio", href: "#" },
  { label: "About", href: "#" },
  { label: "Journal", href: "#" },
  { label: "Reach Us", href: "#" },
];

function App() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="relative z-10 flex min-h-svh flex-col">
        <header className="relative z-10 w-full">
          <nav
            className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6"
            aria-label="Primary"
          >
            <a href="#" className="text-foreground tracking-tight">
              <span
                className="inline-flex items-baseline gap-0.5 font-display text-3xl"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Velorah
                <sup className="translate-y-0.5 text-xs font-normal leading-none">®</sup>
              </span>
            </a>

            <ul className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={
                      link.active
                        ? "text-sm text-foreground transition-colors"
                        : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <Button
              type="button"
              variant="ghost"
              size="pill"
              className="liquid-glass h-auto border-0 px-6 py-2.5 text-sm text-foreground shadow-none hover:scale-[1.03] hover:bg-transparent"
            >
              Begin Journey
            </Button>
          </nav>
        </header>

        <main
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center max-md:py-[90px] md:pt-32 md:pb-40"
          aria-label="Hero"
        >
          <h1
            className="animate-fade-rise max-w-7xl font-normal text-5xl leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
            <em className="not-italic text-muted-foreground">through the silence.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels. Amid the
            chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <Button
            type="button"
            variant="ghost"
            size="hero"
            className="animate-fade-rise-delay-2 liquid-glass mt-12 h-auto cursor-pointer border-0 px-14 py-5 text-base text-foreground shadow-none hover:scale-[1.03] hover:bg-transparent"
          >
            Begin Journey
          </Button>
        </main>
      </div>
    </div>
  );
}

export default App;
