"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "samet-theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
  toggleLightDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return getSystemDark() ? "dark" : "light";
  return preference;
}

function applyDomTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function readStoredPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* ignore */
  }
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pref = readStoredPreference();
    const next = resolveTheme(pref);
    setPreferenceState(pref);
    setResolved(next);
    applyDomTheme(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = mq.matches ? "dark" : "light";
      setResolved(next);
      applyDomTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference, ready]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    const resolvedNext = resolveTheme(next);
    setResolved(resolvedNext);
    applyDomTheme(resolvedNext);
  }, []);

  const toggleLightDark = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggleLightDark }),
    [preference, resolved, setPreference, toggleLightDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/** FOUC önleme — layout <head> içine inline script olarak gömülür */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEY)};var t=localStorage.getItem(k);var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var dark=t==="dark"||(t!=="light"&&d);var r=document.documentElement;r.classList.toggle("dark",dark);r.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
