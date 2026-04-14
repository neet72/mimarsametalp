import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/security/admin";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB / file
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 20; // per window (per admin+ip)

type RateEntry = { count: number; resetAt: number };
const rate = new Map<string, RateEntry>();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "projects");

function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

function safeExtFromType(type: string): string {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/avif") return ".avif";
  return "";
}

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

function safePublicId() {
  const id = crypto.randomBytes(16).toString("hex");
  return `samet-alp/projects/${Date.now()}-${id}`;
}

function signCloudinary(params: Record<string, string>) {
  // Cloudinary signature = sha1(param1=value1&param2=value2... + api_secret)
  const base = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(base + CLOUDINARY_API_SECRET).digest("hex");
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
    return NextResponse.json({ ok: false, error: "Dosya bulunamadı." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Desteklenmeyen dosya türü. (jpg/png/webp/avif)" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Dosya çok büyük (max 8MB)." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const head = bytes.subarray(0, 32);
  if (!matchesMagic(file.type, head)) {
    return NextResponse.json(
      { ok: false, error: "Dosya doğrulanamadı. Lütfen farklı bir görsel deneyin." },
      { status: 400 },
    );
  }

  // On Vercel, local disk is ephemeral. If Cloudinary isn't configured, fail fast.
  if (process.env.VERCEL === "1" && !isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Upload için Cloudinary gerekli. Vercel üzerinde yerel dosya yükleme kalıcı değildir. (CLOUDINARY_* değişkenlerini ayarla)",
      },
      { status: 503 },
    );
  }

  // Prefer Cloudinary if configured; otherwise fallback to local disk (not persistent on Vercel).
  if (isCloudinaryConfigured()) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const public_id = safePublicId();
    const paramsToSign = { public_id, timestamp, folder: "samet-alp/projects" };
    const signature = signCloudinary(paramsToSign);

    const blob = new Blob([arrayBuffer], { type: file.type });

    const fd = new FormData();
    fd.set("file", blob, file.name);
    fd.set("api_key", CLOUDINARY_API_KEY);
    fd.set("timestamp", timestamp);
    fd.set("public_id", public_id);
    fd.set("folder", "samet-alp/projects");
    fd.set("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const res = await fetch(uploadUrl, { method: "POST", body: fd });
    const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };

    if (!res.ok || !json.secure_url) {
      return NextResponse.json(
        { ok: false, error: json.error?.message ?? "Upload başarısız." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, url: json.secure_url });
  }

  const ext = safeExtFromType(file.type);
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomBytes(16).toString("hex");
  const filename = `${Date.now()}-${id}${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(fullPath, bytes);

  const url = `/uploads/projects/${filename}`;
  const warning =
    process.env.VERCEL === "1"
      ? "Vercel üzerinde yerel dosya yükleme kalıcı değildir. Kalıcı olması için Cloudinary/R2 gibi storage kullanın."
      : undefined;
  return NextResponse.json({ ok: true, url, warning });
}

