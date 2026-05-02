"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "./guard";
import { auditAdmin } from "@/lib/observability/audit";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { createSafeAction } from "@/lib/actions/safe-action";

const upsertSchema = z.object({
  key: z.enum(["about", "contact"]),
  locale: z.enum(["tr", "en"]),
  data: z.string().min(2),
});

export async function upsertSiteContent(formData: FormData) {
  const raw = {
    key: String(formData.get("key") ?? ""),
    locale: String(formData.get("locale") ?? ""),
    data: String(formData.get("data") ?? ""),
  };

  const action = createSafeAction({
    scope: "admin.siteContent.upsert",
    schema: upsertSchema,
    authorize: async () => {
      const session = await requireAdmin();
      return { actor: session.user.email ?? "unknown" };
    },
    invalidMessage: "Geçersiz veri.",
    failureMessage: "Kaydedilemedi.",
    handler: async (input, ctx) => {
      await prisma.siteContent.upsert({
        where: { key_locale: { key: input.key, locale: input.locale } },
        create: input,
        update: { data: input.data },
        select: { id: true },
      });

      await auditAdmin({
        actor: ctx.actor ?? "unknown",
        action: "siteContent.upsert",
        entity: "SiteContent",
        entityId: `${input.key}:${input.locale}`,
      });

      revalidatePath("/admin/about");
      revalidatePath("/admin/contact");
      if (input.key === "about") {
        revalidatePath("/hakkimizda");
        revalidatePath("/en/hakkimizda");
      }
      revalidateTag(`site-content:${input.key}:${input.locale}`);
      return undefined;
    },
  });

  return action(raw);
}

export async function getSiteContent(key: "about" | "contact", locale: "tr" | "en") {
  return unstable_cache(
    async () => {
      const row = await prisma.siteContent.findUnique({
        where: { key_locale: { key, locale } },
        select: { data: true, updatedAt: true },
      });
      return row?.data ?? null;
    },
    [`site-content:${key}:${locale}:v1`],
    { revalidate: 60, tags: [`site-content:${key}:${locale}`] },
  )();
}

