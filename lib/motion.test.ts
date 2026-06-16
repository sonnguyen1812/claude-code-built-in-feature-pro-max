import { describe, it, expect } from "vitest";
import { EASE, DUR, clamp, detectOS, tiltFromPointer } from "./motion";

describe("motion tokens", () => {
  it("exposes the mixed-feel easing set", () => {
    expect(EASE.snap).toBe("back.out(2)");
    expect(EASE.elastic).toBe("elastic.out(1,0.5)");
    expect(EASE.smooth).toBe("power3.out");
    expect(EASE.cinematic).toBe("expo.out");
    expect(EASE.scrub).toBe("none");
  });
  it("exposes durations", () => {
    expect(DUR.fast).toBe(0.35);
    expect(DUR.base).toBe(0.6);
    expect(DUR.slow).toBe(1.0);
  });
});

describe("clamp", () => {
  it("clamps within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("detectOS", () => {
  it("detects windows", () => {
    expect(detectOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
  });
  it("detects mac", () => {
    expect(detectOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)")).toBe("mac");
  });
  it("falls back to other", () => {
    expect(detectOS("Mozilla/5.0 (X11; Linux x86_64)")).toBe("other");
  });
});

describe("tiltFromPointer", () => {
  it("returns zero tilt at center", () => {
    const t = tiltFromPointer(50, 50, 100, 100, 8);
    expect(t.rotateX).toBeCloseTo(0);
    expect(t.rotateY).toBeCloseTo(0);
  });
  it("tilts positive on both axes when pointer is at top-right corner", () => {
    const t = tiltFromPointer(100, 0, 100, 100, 8);
    expect(t.rotateY).toBeCloseTo(8);
    expect(t.rotateX).toBeCloseTo(8);
  });
});
