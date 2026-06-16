"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { tiltFromPointer } from "@/lib/motion";

const KIND_STYLE: Record<FeatureKind, string> = {
  command: "bg-brand", skill: "bg-lime", workflow: "bg-sky", flag: "bg-pink", subcommand: "bg-white",
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      const rx = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const { rotateX, rotateY } = tiltFromPointer(e.clientX - r.left, e.clientY - r.top, r.width, r.height, 8);
        rx(rotateX); ry(rotateY);
      };
      const onEnter = () => {
        el.style.willChange = "transform";
        gsap.to(el, { scale: 1.03, boxShadow: "10px 10px 0 0 #0A0A0A", duration: 0.3, ease: "power3.out", overwrite: "auto" });
      };
      const onLeave = () => {
        rx(0); ry(0);
        gsap.to(el, {
          scale: 1, boxShadow: "6px 6px 0 0 #0A0A0A", duration: 0.4, ease: "power3.out", overwrite: "auto",
          onComplete: () => { el.style.willChange = ""; },
        });
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <Link
      ref={ref}
      href={`/feature/${feature.id}`}
      className="feature-card group block border-3 border-ink bg-white p-4 shadow-brutal [transform-style:preserve-3d] [perspective:600px]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold">{feature.name}</span>
        <span className={`shrink-0 border-2 border-ink px-1 text-xs font-bold ${KIND_STYLE[feature.kind]}`}>
          {feature.kind}
        </span>
      </div>
      <p className="mt-2 text-sm">{t(feature.tagline)}</p>
      <div className="mt-2 flex gap-1">
        {feature.deepDive && (
          <span className="border-2 border-ink bg-pink px-1 text-xs font-bold">
            🔬 {lang === "vi" ? "đào sâu" : "deep dive"}
          </span>
        )}
        {feature.verified && (
          <span className="border-2 border-ink bg-lime px-1 text-xs font-bold">
            {lang === "vi" ? "✓ đã xác minh" : "✓ verified"}
          </span>
        )}
      </div>
    </Link>
  );
}
