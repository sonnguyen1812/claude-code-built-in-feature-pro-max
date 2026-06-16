"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function CopyBlock({ code, typewriter = false }: { code: string; typewriter?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(typewriter ? "" : code);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!typewriter || reduced) { setShown(code); return; }
    const obj = { n: 0 };
    const tw = gsap.to(obj, {
      n: code.length, duration: Math.min(2.2, code.length * 0.02), ease: "none",
      onUpdate: () => setShown(code.slice(0, Math.round(obj.n))),
    });
    return () => { tw.kill(); };
  }, [code, typewriter, reduced]);

  const copy = async () => {
    try {
      if (!navigator?.clipboard) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable or permission denied — fail silently
    }
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto border-3 border-ink bg-ink px-4 py-3 font-mono text-sm text-lime">
        <code>{shown}</code>
      </pre>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 border-3 border-paper bg-brand px-2 py-1 text-xs font-bold text-ink"
      >
        {copied ? "✓" : "copy"}
      </button>
    </div>
  );
}
