import { describe, it, expect } from "vitest";
import { validateFeature, type Feature } from "./types";

const good: Feature = {
  id: "compact",
  category: "slash-commands",
  name: "/compact",
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
});
