import "server-only";

import type { z } from "zod";
import { logger } from "@/lib/observability/logger";

export type SafeActionOk<TData> = { ok: true; data?: TData };
export type SafeActionErr<TFieldErrors = Record<string, string[]>> = {
  ok: false;
  error: string;
  fieldErrors?: TFieldErrors;
};
export type SafeActionResult<TData, TFieldErrors = Record<string, string[]>> =
  | SafeActionOk<TData>
  | SafeActionErr<TFieldErrors>;

type ActionCtx = {
  actor?: string;
};

function actorFromAuthorizeResult(v: unknown): string | undefined {
  if (!v || typeof v !== "object") return undefined;
  const actor = (v as Record<string, unknown>).actor;
  return typeof actor === "string" ? actor : undefined;
}

export class ActionError extends Error {
  userMessage: string;
  constructor(userMessage: string) {
    super(userMessage);
    this.name = "ActionError";
    this.userMessage = userMessage;
  }
}

type CreateSafeActionOpts<TSchema extends z.ZodTypeAny, TData, TFieldErrors> = {
  /** For consistent logs like "[admin.project.create]" */
  scope: string;
  schema: TSchema;
  /**
   * Optional authz hook. If provided, it MUST throw/redirect on unauthorized.
   * It can also throw Error("RATE_LIMITED") which will be normalized.
   */
  authorize?: () => Promise<{ actor?: string } | void>;
  /** Convert Zod errors into UI-friendly fieldErrors (optional). */
  toFieldErrors?: (err: z.ZodError) => TFieldErrors;
  handler: (input: z.infer<TSchema>, ctx: ActionCtx) => Promise<TData>;
  /** User-facing invalid payload message */
  invalidMessage?: string;
  /** User-facing generic failure message */
  failureMessage?: string;
};

export function createSafeAction<TSchema extends z.ZodTypeAny, TData, TFieldErrors = Record<string, string[]>>(
  opts: CreateSafeActionOpts<TSchema, TData, TFieldErrors>,
) {
  const invalidMessage = opts.invalidMessage ?? "Geçersiz veri.";
  const failureMessage = opts.failureMessage ?? "İşlem başarısız.";

  return async (raw: unknown): Promise<SafeActionResult<TData, TFieldErrors>> => {
    let actor: string | undefined;
    try {
      if (opts.authorize) {
        const authz = await opts.authorize();
        actor = actorFromAuthorizeResult(authz);
      }
    } catch (e) {
      if (e instanceof Error && e.message === "RATE_LIMITED") {
        logger.warn({ msg: "safe-action rate limited", scope: opts.scope, actor });
        return { ok: false, error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." };
      }
      // redirects (next/navigation) must pass through
      throw e;
    }

    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      logger.warn({
        msg: "safe-action validation failed",
        scope: opts.scope,
        actor,
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
      return {
        ok: false,
        error: invalidMessage,
        fieldErrors: opts.toFieldErrors ? opts.toFieldErrors(parsed.error) : undefined,
      };
    }

    try {
      const data = await opts.handler(parsed.data, { actor });
      logger.info({ msg: "safe-action ok", scope: opts.scope, actor });
      return { ok: true, data };
    } catch (e) {
      if (e instanceof ActionError) {
        logger.warn({ msg: "safe-action rejected", scope: opts.scope, actor, error: e.userMessage });
        return { ok: false, error: e.userMessage };
      }
      logger.error({
        msg: "safe-action failed",
        scope: opts.scope,
        actor,
        error: e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : String(e),
      });
      return { ok: false, error: failureMessage };
    }
  };
}

