export interface I18n {
  vi: string;
  en: string;
}

export type FeatureKind = "command" | "skill" | "workflow" | "flag" | "subcommand";

export interface Feature {
  id: string;
  category: string;
  name: string;
  kind: FeatureKind;
  tagline: I18n;
  whatItDoes: I18n;
  whenToUse: I18n;
  usage: string;
  example?: string;
  deepDive?: I18n;
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
  const kinds = ["command", "skill", "workflow", "flag", "subcommand"];
  if (!kinds.includes(f.kind)) {
    errors.push("kind must be one of command|skill|workflow|flag|subcommand");
  }
  if (!/^https?:\/\//.test(f.sourceUrl)) errors.push("sourceUrl must be http(s)");
  return errors;
}
