"use client";
import type { FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const KINDS: FeatureKind[] = ["command", "skill", "workflow", "flag", "subcommand"];

export default function SearchFilter({
  query, setQuery, active, toggleKind,
}: {
  query: string;
  setQuery: (s: string) => void;
  active: Set<FeatureKind>;
  toggleKind: (k: FeatureKind) => void;
}) {
  const { lang } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === "vi" ? "Tìm lệnh, skill, flag..." : "Search commands, skills, flags..."}
        className="w-full border-3 border-ink bg-white px-4 py-3 font-mono shadow-brutal focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => toggleKind(k)}
            aria-pressed={active.has(k)}
            className={`border-3 border-ink px-3 py-1 text-sm font-bold shadow-brutal-sm ${
              active.has(k) ? "bg-ink text-paper" : "bg-white text-ink"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
