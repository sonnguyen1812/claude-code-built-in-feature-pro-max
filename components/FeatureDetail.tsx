"use client";
import Link from "next/link";
import type { Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CopyBlock from "./CopyBlock";

export default function FeatureDetail({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8">
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

      <h3 className="mt-8 text-lg font-black uppercase">{lang === "vi" ? "Cách dùng" : "Usage"}</h3>
      <div className="mt-2"><CopyBlock code={feature.usage} /></div>

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
