"use client";
import { useState } from "react";

export default function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative">
      <pre className="overflow-x-auto border-3 border-ink bg-ink px-4 py-3 font-mono text-sm text-lime">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute right-2 top-2 border-3 border-paper bg-brand px-2 py-1 text-xs font-bold text-ink"
      >
        {copied ? "✓" : "copy"}
      </button>
    </div>
  );
}
