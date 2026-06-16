"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Hero() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".hero-line", {
        y: 60, opacity: 0, rotate: -2, duration: 0.7,
        ease: "power4.out", stagger: 0.12,
      });
      // Shadow "slam" runs on box-shadow only — a property the reveal tween
      // never touches — so it can't fight hero-line over opacity/transform.
      tl.fromTo(
        ".hero-shadow",
        { boxShadow: "0px 0px 0px 0px rgba(10,10,10,1)" },
        { boxShadow: "10px 10px 0px 0px rgba(10,10,10,1)", duration: 0.4, ease: "power3.out" },
        "-=0.15"
      );
    }, root);
    return () => ctx.revert();
  }, [reduced, lang]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
        <span className="hero-line block">CLAUDE CODE</span>
        <span className="hero-line hero-shadow mt-2 inline-block border-3 border-ink bg-brand px-3 shadow-brutal-lg">
          {lang === "vi" ? "TOÀN BỘ TÍNH NĂNG" : "EVERY FEATURE"}
        </span>
      </h1>
      <p className="hero-line mt-6 max-w-xl text-lg md:text-xl">
        {lang === "vi"
          ? "Khám phá hệ sinh thái Claude Code: lệnh, skills, workflows, agents và hơn thế. Bấm vào từng cái để hiểu sâu và dùng được ngay."
          : "Explore the Claude Code ecosystem: commands, skills, workflows, agents and more. Click any item to deep-dive and start using it."}
      </p>
    </div>
  );
}
