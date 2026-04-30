import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/security/admin";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm"]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 20; // per window (per admin+ip)

type RateEntry = { count: number; resetAt: number };
const rate = new Map<string, RateEntry>();

function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("fastly-client-ip") ||
    "unknown"
  );
}

function rateLimit(key: string) {
  const now = Date.now();
  const existing = rate.get(key);
  if (!existing || now >= existing.resetAt) {
    rate.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true as const, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { ok: false as const, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rate.set(key, existing);
  return { ok: true as const, remaining: Math.max(0, RATE_LIMIT_MAX - existing.count), resetAt: existing.resetAt };
}

function looksLikeJpeg(bytes: Buffer) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function looksLikePng(bytes: Buffer) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function looksLikeWebp(bytes: Buffer) {
  // RIFF....WEBP
  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

function looksLikeAvif(bytes: Buffer) {
  // ISO BMFF: ....ftypavif / ftypavis (common for AV1 images)
  if (bytes.length < 16) return false;
  const box = bytes.toString("ascii", 4, 8);
  if (box !== "ftyp") return false;
  const major = bytes.toString("ascii", 8, 12);
  return major === "avif" || major === "avis";
}

function matchesMagic(type: string, bytes: Buffer) {
  if (type === "image/jpeg") return looksLikeJpeg(bytes);
  if (type === "image/png") return looksLikePng(bytes);
  if (type === "image/webp") return looksLikeWebp(bytes);
  if (type === "image/avif") return looksLikeAvif(bytes);
  return false;
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!email || !isAdminEmail(email)) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limiter = rateLimit(`${email}:${ip}`);
  if (!limiter.ok) {
    logger.warn({ msg: "upload rate limited", scope: "api.admin.upload", actor: email, ip });
    return NextResponse.json(
      {
        ok: false,
        error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin.",
        retryAfterMs: Math.max(0, limiter.resetAt - Date.now()),
      },
      { status: 429 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    logger.warn({ msg: "upload missing file", scope: "api.admin.upload", actor: email, ip });
    return NextResponse.json({ ok: false, error: "Dosya bulunamadı." }, { status: 400 });
  }

  const isImage = IMAGE_MIME.has(file.type);
  const isVideo = VIDEO_MIME.has(file.type);
  if (!isImage && !isVideo) {
    logger.warn({ msg: "upload invalid mime", scope: "api.admin.upload", actor: email, ip, mime: file.type });
    return NextResponse.json(
      { ok: false, error: "Desteklenmeyen dosya türü. (jpg/png/webp/avif/mp4/webm)" },
      { status: 400 },
    );
  }

  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    logger.warn({
      msg: "upload too large",
      scope: "api.admin.upload",
      actor: email,
      ip,
      mime: file.type,
      size: file.size,
      max,
    });
    return NextResponse.json(
      { ok: false, error: isVideo ? "Video çok büyük (max 50MB)." : "Görsel çok büyük (max 5MB)." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const head = bytes.subarray(0, 32);
  if (isImage && !matchesMagic(file.type, head)) {
    logger.warn({
      msg: "upload magic bytes mismatch",
      scope: "api.admin.upload",
      actor: email,
      ip,
      mime: file.type,
    });
    return NextResponse.json(
      { ok: false, error: "Dosya doğrulanamadı. Lütfen farklı bir görsel deneyin." },
      { status: 400 },
    );
  }

  logger.info({ msg: "upload attempt", scope: "api.admin.upload", actor: email, ip, mime: file.type, size: file.size });

  const uploaded = await uploadToCloudinary({
    buffer: bytes,
    mimeType: file.type,
    actor: email,
  });

  logger.info({
    msg: "upload ok",
    scope: "api.admin.upload",
    actor: email,
    ip,
    publicId: uploaded.publicId,
    resourceType: uploaded.resourceType,
  });

  return NextResponse.json({ ok: true, url: uploaded.secureUrl });
}

