export type AboutCmsDraft = {
  /** MP4 tam URL veya `/videos/...` yolu */
  heroVideoUrl: string;
  /** Video yüklenene kadar gösterilecek kapak; portreyle aynı dosyayı kullanmayın (layout flash) */
  heroPosterUrl: string;
  visionTitle: string;
  visionBody: string;
  architectName: string;
  architectRole: string;
  architectBio: string;
  portraitImageUrl: string;
};

const emptyDraft: AboutCmsDraft = {
  heroVideoUrl: "",
  heroPosterUrl: "",
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
      heroVideoUrl: typeof j.heroVideoUrl === "string" ? j.heroVideoUrl : "",
      heroPosterUrl: typeof j.heroPosterUrl === "string" ? j.heroPosterUrl : "",
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
  const heroVideo =
    (typeof p.heroVideoUrl === "string" && p.heroVideoUrl.trim()) ||
    (typeof s.heroVideoUrl === "string" && s.heroVideoUrl.trim()) ||
    "";
  const heroPoster =
    (typeof p.heroPosterUrl === "string" && p.heroPosterUrl.trim()) ||
    (typeof s.heroPosterUrl === "string" && s.heroPosterUrl.trim()) ||
    "";
  const merged: AboutCmsDraft = {
    ...p,
    portraitImageUrl: portrait,
    heroVideoUrl: heroVideo,
    heroPosterUrl: heroPoster,
  };
  const hasAny =
    merged.visionTitle.trim() ||
    merged.visionBody.trim() ||
    merged.architectName.trim() ||
    merged.architectRole.trim() ||
    merged.architectBio.trim() ||
    portrait ||
    heroVideo ||
    heroPoster;
  return hasAny ? merged : null;
}
