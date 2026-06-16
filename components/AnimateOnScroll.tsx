"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function AnimateOnScroll({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const anim = gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      }
    );
    return () => { anim.scrollTrigger?.kill(); anim.kill(); };
  }, [reduced, delay]);

  return <div ref={ref}>{children}</div>;
}
