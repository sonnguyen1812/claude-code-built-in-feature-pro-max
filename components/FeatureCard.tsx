"use client";
import Link from "next/link";
import type { Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const KIND_STYLE: Record<FeatureKind, string> = {
  command: "bg-brand",
  skill: "bg-lime",
  workflow: "bg-sky",
  flag: "bg-pink",
  subcommand: "bg-white",
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  return (
    <Link
      href={`/feature/${feature.id}`}
      className="group block border-3 border-ink bg-white p-4 shadow-brutal transition-transform hover:-translate-x-1 hover:-translate-y-1"
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
