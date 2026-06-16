"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, DUR } from "@/lib/motion";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

export default function Hero() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    let splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      const heads = gsap.utils.toArray<HTMLElement>(".hero-kinetic");
      splits = heads.map((el) => new SplitText(el, { type: "chars" }));
      const chars = splits.flatMap((s) => s.chars);

      const tl = gsap.timeline();
      tl.from(chars, {
        yPercent: 120, rotateX: -90, opacity: 0,
        duration: DUR.base, ease: EASE.snap, stagger: 0.025,
      });
      tl.from(".hero-line", { y: 40, opacity: 0, duration: DUR.base, ease: EASE.smooth }, "-=0.3");
      tl.fromTo(".hero-shadow",
        { boxShadow: "0px 0px 0px 0px rgba(10,10,10,1)" },
        { boxShadow: "10px 10px 0px 0px rgba(10,10,10,1)", duration: DUR.fast, ease: EASE.smooth },
        "-=0.4");
      tl.fromTo(".hero-sweep",
        { backgroundPosition: "-150% 0" },
        { backgroundPosition: "250% 0", duration: 0.9, ease: "power2.inOut" },
        "-=0.2");

      gsap.to(".hero-shadow", {
        rotate: 0.5, duration: 2.2, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center",
      });
    }, root);
    return () => {
      ctx.revert();
      splits.forEach((s) => s.revert());
    };
  }, [reduced, lang]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
        <span className="hero-kinetic block [perspective:600px]" aria-label="CLAUDE CODE">CLAUDE CODE</span>
        <span className="hero-kinetic hero-shadow hero-sweep mt-2 inline-block border-3 border-ink bg-brand bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] bg-[length:250%_100%] px-3 shadow-brutal-lg [perspective:600px]" aria-label={lang === "vi" ? "TOÀN BỘ TÍNH NĂNG" : "EVERY FEATURE"}>
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
