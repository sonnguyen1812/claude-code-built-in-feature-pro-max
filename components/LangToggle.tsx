"use client";
import { useLang } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex border-3 border-ink shadow-brutal-sm" role="group" aria-label="Language">
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-3 py-1 font-bold uppercase ${
            lang === l ? "bg-ink text-paper" : "bg-white text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
