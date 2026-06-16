"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !dot.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current;
    const x = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("a,button,input,[role=button]");
    let interactive = false;
    const over = (e: PointerEvent) => {
      const hit = isInteractive(e.target);
      if (hit === interactive) return;
      interactive = hit;
      gsap.to(el, { scale: hit ? 2.4 : 1, backgroundColor: hit ? "#D97706" : "transparent", duration: 0.2 });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 1 });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [reduced]);

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-5 w-5 rounded-full border-3 border-ink opacity-0 mix-blend-difference"
    />
  );
}
