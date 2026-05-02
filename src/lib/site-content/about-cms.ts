export type AboutCmsDraft = {
  visionTitle: string;
  visionBody: string;
  architectName: string;
  architectRole: string;
  architectBio: string;
  portraitImageUrl: string;
};

const emptyDraft: AboutCmsDraft = {
  visionTitle: "",
  visionBody: "",
  architectName: "",
  architectRole: "",
  architectBio: "",
  portraitImageUrl: "",
};

/** Admin `AboutAdminPanel` ile aynı JSON şekli — boş/geçersiz alanları normalize eder. */
export function parseAboutCms(raw: string | null | undefined): AboutCmsDraft | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as Partial<AboutCmsDraft>;
    if (!j || typeof j !== "object") return null;
    return {
      ...emptyDraft,
      visionTitle: typeof j.visionTitle === "string" ? j.visionTitle : "",
      visionBody: typeof j.visionBody === "string" ? j.visionBody : "",
      architectName: typeof j.architectName === "string" ? j.architectName : "",
      architectRole: typeof j.architectRole === "string" ? j.architectRole : "",
      architectBio: typeof j.architectBio === "string" ? j.architectBio : "",
      portraitImageUrl: typeof j.portraitImageUrl === "string" ? j.portraitImageUrl : "",
    };
  } catch {
    return null;
  }
}

/** Metin vb. ilk dilden gelir; portre URL’si yoksa ikinci kayıttan doldurulur (tek görsel iki dil için). */
export function mergeAboutWithPortraitFallback(
  primary: AboutCmsDraft | null,
  secondary: AboutCmsDraft | null,
): AboutCmsDraft | null {
  if (!primary && !secondary) return null;
  const p = primary ?? emptyDraft;
  const s = secondary ?? emptyDraft;
  const portrait =
    (typeof p.portraitImageUrl === "string" && p.portraitImageUrl.trim()) ||
    (typeof s.portraitImageUrl === "string" && s.portraitImageUrl.trim()) ||
    "";
  const merged: AboutCmsDraft = { ...p, portraitImageUrl: portrait };
  const hasAny =
    merged.visionTitle.trim() ||
    merged.visionBody.trim() ||
    merged.architectName.trim() ||
    merged.architectRole.trim() ||
    merged.architectBio.trim() ||
    portrait;
  return hasAny ? merged : null;
}
