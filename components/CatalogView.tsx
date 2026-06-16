"use client";
import { useMemo, useState } from "react";
import type { Category, Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import SearchFilter from "./SearchFilter";
import CategorySection from "./CategorySection";

export default function CatalogView({
  categories, features,
}: {
  categories: Category[];
  features: Feature[];
}) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<FeatureKind>>(new Set());

  const toggleKind = (k: FeatureKind) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return features.filter((f) => {
      if (active.size > 0 && !active.has(f.kind)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.tagline.vi.toLowerCase().includes(q) ||
        f.tagline.en.toLowerCase().includes(q)
      );
    });
  }, [features, query, active]);

  const visibleCategories = categories.filter(
    (c) => filtered.some((f) => f.category === c.id)
  );

  return (
    <div>
      <SearchFilter query={query} setQuery={setQuery} active={active} toggleKind={toggleKind} />
      {visibleCategories.length === 0 ? (
        <p className="mx-auto max-w-6xl px-4 py-12 text-lg md:px-8">
          {lang === "vi" ? "Không tìm thấy mục nào." : "No matching items."}
        </p>
      ) : (
        visibleCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            features={filtered.filter((f) => f.category === cat.id)}
          />
        ))
      )}
    </div>
  );
}
