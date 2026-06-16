"use client";
import type { Category, Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import FeatureCard from "./FeatureCard";
import AnimateOnScroll from "./AnimateOnScroll";

export default function CategorySection({
  category,
  features,
}: {
  category: Category;
  features: Feature[];
}) {
  const { t } = useLang();
  const accent = {
    brand: "bg-brand", lime: "bg-lime", sky: "bg-sky", pink: "bg-pink",
  }[category.accent];

  return (
    <section id={category.id} className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <AnimateOnScroll>
        <div className={`inline-block border-3 border-ink ${accent} px-3 py-1 shadow-brutal-sm`}>
          <h2 className="text-2xl font-black uppercase">{t(category.label)}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-lg">{t(category.blurb)}</p>
      </AnimateOnScroll>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <AnimateOnScroll key={f.id} delay={i * 0.05}>
            <FeatureCard feature={f} />
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
