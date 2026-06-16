export interface I18n {
  vi: string;
  en: string;
}

export interface Feature {
  id: string;
  category: string;
  name: string;
  tagline: I18n;
  whatItDoes: I18n;
  whenToUse: I18n;
  usage: string;
  example?: string;
  sourceUrl: string;
  verified: boolean;
}

export interface Category {
  id: string;
  label: I18n;
  blurb: I18n;
  accent: "brand" | "lime" | "sky" | "pink";
}

export function validateFeature(f: Feature): string[] {
  const errors: string[] = [];
  if (!f.id) errors.push("id is required");
  if (!f.name) errors.push("name is required");
  if (!f.category) errors.push("category is required");
  for (const key of ["tagline", "whatItDoes", "whenToUse"] as const) {
    if (!f[key]?.vi) errors.push(`${key}.vi is required`);
    if (!f[key]?.en) errors.push(`${key}.en is required`);
  }
  if (!/^https?:\/\//.test(f.sourceUrl)) errors.push("sourceUrl must be http(s)");
  return errors;
}
