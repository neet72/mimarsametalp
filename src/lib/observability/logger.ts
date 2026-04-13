import "server-only";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown> & {
  msg: string;
  scope?: string;
};

function write(level: LogLevel, payload: LogPayload) {
  const base = {
    level,
    time: new Date().toISOString(),
    ...payload,
  };

  const line = JSON.stringify(base);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (payload: LogPayload) => write("debug", payload),
  info: (payload: LogPayload) => write("info", payload),
  warn: (payload: LogPayload) => write("warn", payload),
  error: (payload: LogPayload) => write("error", payload),
};

