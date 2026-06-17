"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category, Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, DUR } from "@/lib/motion";
import FeatureCard from "./FeatureCard";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function CategorySection({
  category, features,
}: {
  category: Category;
  features: Feature[];
}) {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const accent = { brand: "bg-brand", lime: "bg-lime", sky: "bg-sky", pink: "bg-pink" }[category.accent];
  const idKey = features.map((f) => f.id).join(",");

  // Card explosion — re-runs whenever the rendered card set changes (idKey).
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const cards = Array.from(root.current!.querySelectorAll<HTMLElement>(".feature-card"));
      gsap.set(cards, { opacity: 0, scale: 0.6, y: 60, rotate: () => gsap.utils.random(-8, 8) });
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, scale: 1, y: 0, rotate: 0,
            duration: DUR.base, ease: EASE.snap,
            stagger: { each: 0.06, grid: "auto", from: "start" },
          }),
      });
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, [reduced, idKey]);

  // Title scrub — independent of filtering, runs once per mount.
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const title = root.current!.querySelector(".cat-title");
      if (title) {
        gsap.fromTo(title, { scale: 0.85 }, {
          scale: 1, ease: EASE.scrub,
          scrollTrigger: { trigger: title, start: "top 90%", end: "top 55%", scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id={category.id} className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className={`cat-title inline-block border-3 border-ink ${accent} px-3 py-1 shadow-brutal-sm`}>
        <h2 className="text-2xl font-black uppercase">{t(category.label)}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-lg">{t(category.blurb)}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </section>
  );
}
