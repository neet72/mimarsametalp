import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/security/admin";
import { createSignedDirectUpload, isCloudinaryConfigured } from "@/lib/storage/cloudinary";
import { logger } from "@/lib/observability/logger";
import {
  MAX_ADMIN_IMAGE_BYTES,
  MAX_ADMIN_VIDEO_BYTES,
  formatBytesMb,
} from "@/lib/admin/upload-limits";

export const runtime = "nodejs";

const IMAGE_PREFIX = "image/";
const VIDEO_PREFIX = "video/";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email || session?.user?.role !== "admin" || !isAdminEmail(email)) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ ok: false, error: "Cloudinary yapılandırılmamış." }, { status: 500 });
  }

  let body: { mimeType?: string; filename?: string; size?: number } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const mimeType = String(body.mimeType ?? "").trim().toLowerCase();
  const filename = typeof body.filename === "string" ? body.filename : undefined;
  const size = typeof body.size === "number" ? body.size : 0;

  const isImage = mimeType.startsWith(IMAGE_PREFIX);
  const isVideo = mimeType.startsWith(VIDEO_PREFIX);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { ok: false, error: "Desteklenmeyen dosya türü. (görsel veya video)" },
      { status: 400 },
    );
  }

  const max = isVideo ? MAX_ADMIN_VIDEO_BYTES : MAX_ADMIN_IMAGE_BYTES;
  if (size > max) {
    return NextResponse.json(
      {
        ok: false,
        error: isVideo
          ? `Video çok büyük (${formatBytesMb(size)} / max ${formatBytesMb(max)}).`
          : `Görsel çok büyük (${formatBytesMb(size)} / max ${formatBytesMb(max)}).`,
      },
      { status: 400 },
    );
  }

  try {
    const signed = createSignedDirectUpload({
      mimeType,
      originalFilename: filename,
      folderKind: "portfolio",
    });
    logger.info({
      msg: "direct upload signed",
      scope: "api.admin.upload.sign",
      actor: email,
      mime: mimeType,
      size,
    });
    return NextResponse.json({ ok: true, ...signed });
  } catch (e) {
    logger.error({
      msg: "direct upload sign failed",
      scope: "api.admin.upload.sign",
      actor: email,
      error: e instanceof Error ? { name: e.name, message: e.message } : String(e),
    });
    return NextResponse.json({ ok: false, error: "İmza oluşturulamadı." }, { status: 500 });
  }
}
