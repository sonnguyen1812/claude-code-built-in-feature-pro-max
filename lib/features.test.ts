import { describe, it, expect } from "vitest";
import { CATEGORIES, FEATURES } from "./features";
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
  it("has at least 15 features", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(15);
  });
});
