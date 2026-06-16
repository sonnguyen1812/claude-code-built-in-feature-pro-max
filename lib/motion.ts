export const EASE = {
  snap: "back.out(2)",
  elastic: "elastic.out(1,0.5)",
  smooth: "power3.out",
  cinematic: "expo.out",
  scrub: "none",
} as const;

export const DUR = { fast: 0.35, base: 0.6, slow: 1.0 } as const;

export type OS = "windows" | "mac" | "other";

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function detectOS(ua: string): OS {
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "other";
}

/**
 * Map a pointer position within an element to a 3D tilt.
 * Pointer toward the top => positive rotateX; toward the right => positive rotateY.
 * Returns 0/0 at the element center.
 */
export function tiltFromPointer(
  px: number, py: number, w: number, h: number, maxDeg: number
): { rotateX: number; rotateY: number } {
  const nx = (px / w) * 2 - 1; // -1..1, left..right
  const ny = (py / h) * 2 - 1; // -1..1, top..bottom
  return {
    rotateY: clamp(nx, -1, 1) * maxDeg,
    rotateX: clamp(-ny, -1, 1) * maxDeg,
  };
}
