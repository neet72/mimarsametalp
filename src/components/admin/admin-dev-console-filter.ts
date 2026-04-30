"use client";

export {};

declare global {
  interface Window {
    __adminConsoleFilterInstalled?: boolean;
    __adminConsoleOriginalError?: typeof console.error;
  }
}

// Install as early as possible (module import time). This runs before React mounts.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!window.__adminConsoleFilterInstalled) {
    window.__adminConsoleFilterInstalled = true;
    window.__adminConsoleOriginalError = console.error;

    console.error = (...args: unknown[]) => {
      const text = args
        .map((a) => {
          if (typeof a === "string") return a;
          if (a instanceof Error) return `${a.name}: ${a.message}`;
          try {
            return JSON.stringify(a);
          } catch {
            return "";
          }
        })
        .join(" ");

      if (
        text.includes('Each child in a list should have a unique "key" prop') ||
        text.includes("Each child in a list should have a unique") ||
        text.includes("warning-keys") ||
        text.includes("OuterLayoutRouter")
      ) {
        return;
      }

      window.__adminConsoleOriginalError?.(...args);
    };
  }
}

