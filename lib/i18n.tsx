"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { I18n } from "./types";

export type Lang = "vi" | "en";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (v: I18n) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "vi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (v: I18n) => v[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
