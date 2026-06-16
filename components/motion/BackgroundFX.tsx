"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function BackgroundFX() {
  const grid = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !grid.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = grid.current;
    const xTo = gsap.quickTo(el, "x", { duration: 1.2, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 1.2, ease: "power2.out" });
    const move = (e: PointerEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * 30);
      yTo((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);

  return (
    <div
      ref={grid}
      aria-hidden
      className="pointer-events-none fixed inset-[-30px] -z-10 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}
