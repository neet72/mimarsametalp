"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { localeFromPathname } from "@/lib/locale";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, toggleLightDark } = useTheme();
  const pathname = usePathname();
  const isEn = localeFromPathname(pathname) === "en";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin paneli kendi zinc dark UI’sini kullanır
  if (pathname.startsWith("/admin")) return null;

  const isDark = mounted && resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggleLightDark}
      className={cn(
        "touch-manipulation inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/90 text-primary transition-colors",
        "hover:border-accent/40 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "sm:h-9 sm:w-9",
        className,
      )}
      aria-label={
        isDark
          ? isEn
            ? "Switch to light mode"
            : "Aydınlık moda geç"
          : isEn
            ? "Switch to dark mode"
            : "Karanlık moda geç"
      }
      title={isDark ? (isEn ? "Light" : "Aydınlık") : isEn ? "Dark" : "Karanlık"}
    >
      {!mounted ? (
        <span className="h-4 w-4 rounded-full bg-border/80" aria-hidden />
      ) : isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
