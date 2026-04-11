const TR: Record<string, string> = {
  ğ: "g",
  ü: "u",
  ş: "s",
  ı: "i",
  ö: "o",
  ç: "c",
  İ: "i",
  Ğ: "g",
  Ü: "u",
  Ş: "s",
  Ö: "o",
  Ç: "c",
};

export function slugify(input: string): string {
  let s = input.trim().toLowerCase();
  for (const [k, v] of Object.entries(TR)) {
    s = s.split(k).join(v);
  }
  s = s
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s || "proje";
}
