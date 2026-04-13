import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/security/admin";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB / file

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

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Dosya bulunamadı." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Sadece görsel dosyaları." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Dosya çok büyük (max 8MB)." }, { status: 400 });
  }

  // Prefer Cloudinary if configured; otherwise fallback to local disk (not persistent on Vercel).
  if (isCloudinaryConfigured()) {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const public_id = safePublicId();
    const paramsToSign = { public_id, timestamp, folder: "samet-alp/projects" };
    const signature = signCloudinary(paramsToSign);

    const arrayBuffer = await file.arrayBuffer();
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

  const ext = safeExtFromType(file.type) || path.extname(file.name).slice(0, 10);
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Desteklenmeyen dosya türü." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomBytes(16).toString("hex");
  const filename = `${Date.now()}-${id}${ext.startsWith(".") ? ext : `.${ext}`}`;
  const fullPath = path.join(UPLOAD_DIR, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

  const url = `/uploads/projects/${filename}`;
  return NextResponse.json({ ok: true, url });
}

