import { describe, it, expect } from "vitest";
import { CATEGORIES, FEATURES } from "./features";
import { DEEP_DIVES } from "./deepdives";
import { validateFeature } from "./types";

describe("features dataset", () => {
  it("has the 9 functional categories", () => {
    const ids = CATEGORIES.map((c) => c.id).sort();
    expect(ids).toEqual(
      [
        "between-sessions", "cli", "diagnostics", "during-task",
        "parallel", "review-ship", "setup", "skills", "workflows",
      ].sort()
    );
  });
  it("has unique feature ids", () => {
    const ids = FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every feature passes validateFeature", () => {
    for (const f of FEATURES) {
      expect(validateFeature(f), `feature ${f.id}`).toEqual([]);
    }
  });
  it("every feature category exists in CATEGORIES", () => {
    const catIds = new Set(CATEGORIES.map((c) => c.id));
    for (const f of FEATURES) {
      expect(catIds.has(f.category), `feature ${f.id} -> ${f.category}`).toBe(true);
    }
  });
  it("has at least 80 features", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(80);
  });
  it("every feature has a valid kind", () => {
    const kinds = ["command", "skill", "workflow", "flag", "subcommand"];
    for (const f of FEATURES) {
      expect(kinds.includes(f.kind), `feature ${f.id} kind ${f.kind}`).toBe(true);
    }
  });
  it("all bundled skills are in the skills category", () => {
    for (const f of FEATURES) {
      if (f.kind === "skill") expect(f.category).toBe("skills");
    }
  });
  it("attaches every deepDive to an existing feature", () => {
    const ids = new Set(FEATURES.map((f) => f.id));
    for (const id of Object.keys(DEEP_DIVES)) {
      expect(ids.has(id), `deepDive id ${id} has no feature`).toBe(true);
    }
  });
  it("features with a deepDive expose it", () => {
    const withDive = FEATURES.filter((f) => f.deepDive);
    expect(withDive.length).toBeGreaterThanOrEqual(15);
  });
});
