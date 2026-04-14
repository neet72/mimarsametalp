"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "./guard";
import { auditAdmin } from "@/lib/observability/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const upsertSchema = z.object({
  key: z.enum(["about", "contact"]),
  locale: z.enum(["tr", "en"]),
  data: z.string().min(2),
});

export async function upsertSiteContent(formData: FormData) {
  let actor = "unknown";
  try {
    const session = await requireAdmin();
    actor = session.user.email ?? "unknown";
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return { ok: false as const, error: "Çok fazla istek." };
    }
    throw e;
  }

  const raw = {
    key: String(formData.get("key") ?? ""),
    locale: String(formData.get("locale") ?? ""),
    data: String(formData.get("data") ?? ""),
  };

  const parsed = upsertSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Geçersiz veri." };

  try {
    await prisma.siteContent.upsert({
      where: { key_locale: { key: parsed.data.key, locale: parsed.data.locale } },
      create: parsed.data,
      update: { data: parsed.data.data },
      select: { id: true },
    });
    await auditAdmin({
      actor,
      action: "siteContent.upsert",
      entity: "SiteContent",
      entityId: `${parsed.data.key}:${parsed.data.locale}`,
    });
  } catch (e) {
    console.error("[upsertSiteContent]", e);
    return { ok: false as const, error: "Kaydedilemedi. (DB push/migrate gerekli olabilir.)" };
  }

  revalidatePath("/admin/about");
  revalidatePath("/admin/contact");
  return { ok: true as const };
}

export async function getSiteContent(key: "about" | "contact", locale: "tr" | "en") {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key_locale: { key, locale } },
      select: { data: true },
    });
    return row?.data ?? null;
  } catch {
    return null;
  }
}

