"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE } from "@/lib/motion";

export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // skip initial load
    if (reduced || !overlay.current) return;
    const el = overlay.current;
    gsap.killTweensOf(el);
    const tl = gsap.timeline();
    tl.set(el, { scaleX: 0, transformOrigin: "left center", opacity: 1 });
    tl.to(el, { scaleX: 1, duration: 0.35, ease: EASE.cinematic });
    tl.set(el, { transformOrigin: "right center" });
    tl.to(el, { scaleX: 0, duration: 0.4, ease: EASE.cinematic });
    tl.set(el, { opacity: 0 });
  }, [pathname, reduced]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] origin-left scale-x-0 bg-ink opacity-0"
    />
  );
}
