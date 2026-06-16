import { describe, it, expect } from "vitest";
import { validateFeature, type Feature } from "./types";

const good: Feature = {
  id: "compact",
  category: "slash-commands",
  name: "/compact",
  kind: "command",
  tagline: { vi: "Nén hội thoại", en: "Compact the conversation" },
  whatItDoes: { vi: "Tóm tắt context", en: "Summarizes context" },
  whenToUse: { vi: "Khi context dài", en: "When context is long" },
  usage: "/compact",
  sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode",
  verified: false,
};

describe("validateFeature", () => {
  it("accepts a well-formed feature", () => {
    expect(validateFeature(good)).toEqual([]);
  });
  it("flags an empty id", () => {
    expect(validateFeature({ ...good, id: "" })).toContain("id is required");
  });
  it("flags a missing English tagline", () => {
    expect(
      validateFeature({ ...good, tagline: { vi: "x", en: "" } })
    ).toContain("tagline.en is required");
  });
  it("flags a non-http sourceUrl", () => {
    expect(validateFeature({ ...good, sourceUrl: "ftp://x" })).toContain(
      "sourceUrl must be http(s)"
    );
  });
  it("flags an invalid kind", () => {
    expect(validateFeature({ ...good, kind: "bogus" as never })).toContain(
      "kind must be one of command|skill|workflow|flag|subcommand"
    );
  });
  it("accepts an optional deepDive", () => {
    expect(
      validateFeature({ ...good, deepDive: { vi: "giải thích", en: "explain" } })
    ).toEqual([]);
  });
});
