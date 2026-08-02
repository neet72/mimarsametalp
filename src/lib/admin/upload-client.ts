/** Admin medya yükleme — server action yerine REST (çoklu yüklemede RSC hatasını önler). */

export type AdminUploadOk = { ok: true; url: string };
export type AdminUploadErr = { ok: false; error: string };
export type AdminUploadResult = AdminUploadOk | AdminUploadErr;

export async function uploadAdminMediaViaApi(file: File): Promise<AdminUploadResult> {
  const fd = new FormData();
  fd.set("file", file);

  let res: Response;
  try {
    res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, error: "Ağ hatası. Bağlantınızı kontrol edip tekrar deneyin." };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    return {
      ok: false,
      error:
        res.status === 413
          ? "Dosya çok büyük."
          : `Sunucu yanıtı okunamadı (${res.status}).`,
    };
  }

  const obj = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
  if (res.ok && obj?.ok === true && typeof obj.url === "string") {
    return { ok: true, url: obj.url };
  }

  const err =
    obj && typeof obj.error === "string" && obj.error.trim()
      ? obj.error
      : `Yükleme başarısız (${res.status}).`;
  return { ok: false, error: err };
}
