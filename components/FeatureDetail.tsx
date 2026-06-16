"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";
import CopyBlock from "./CopyBlock";

export default function FeatureDetail({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(root.current!.children, {
        y: 30, opacity: 0, duration: DUR.base, ease: EASE.smooth, stagger: 0.08,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, feature.id]);

  return (
    <article ref={root} className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/" className="brutal-btn inline-block text-sm">
        ← {lang === "vi" ? "Tất cả tính năng" : "All features"}
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <h1 className="font-mono text-3xl font-black md:text-4xl">{feature.name}</h1>
        {feature.verified && (
          <span className="border-2 border-ink bg-lime px-2 py-1 text-xs font-bold">{lang === "vi" ? "✓ đã xác minh" : "✓ verified"}</span>
        )}
      </div>
      <p className="mt-2 text-xl">{t(feature.tagline)}</p>

      <Section title={lang === "vi" ? "Là gì" : "What it does"}>{t(feature.whatItDoes)}</Section>
      <Section title={lang === "vi" ? "Khi nào dùng" : "When to use"}>{t(feature.whenToUse)}</Section>

      {feature.deepDive && (
        <div className="mt-8 border-3 border-ink bg-pink/30 p-4 shadow-brutal-sm">
          <h3 className="text-lg font-black uppercase">
            🔬 {lang === "vi" ? "Đào sâu (kiểu Feynman)" : "Deep dive (Feynman)"}
          </h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{t(feature.deepDive)}</p>
        </div>
      )}

      <h3 className="mt-8 text-lg font-black uppercase">{lang === "vi" ? "Cách dùng" : "Usage"}</h3>
      <div className="mt-2"><CopyBlock key={feature.id} code={feature.usage} typewriter /></div>

      {feature.example && (
        <>
          <h3 className="mt-6 text-lg font-black uppercase">{lang === "vi" ? "Ví dụ" : "Example"}</h3>
          <div className="mt-2"><CopyBlock code={feature.example} /></div>
        </>
      )}

      <a
        href={feature.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block underline decoration-brand decoration-2 underline-offset-4"
      >
        {lang === "vi" ? "Nguồn tài liệu chính thức ↗" : "Official documentation source ↗"}
      </a>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-black uppercase">{title}</h3>
      <p className="mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
