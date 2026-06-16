"use client";
import Link from "next/link";
import type { Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useLang();
  return (
    <Link
      href={`/feature/${feature.id}`}
      className="group block border-3 border-ink bg-white p-4 shadow-brutal transition-transform hover:-translate-x-1 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold">{feature.name}</span>
        {feature.verified && (
          <span className="shrink-0 border-2 border-ink bg-lime px-1 text-xs font-bold">
            ✓ verified
          </span>
        )}
      </div>
      <p className="mt-2 text-sm">{t(feature.tagline)}</p>
    </Link>
  );
}
