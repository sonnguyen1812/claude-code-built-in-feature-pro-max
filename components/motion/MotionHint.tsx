"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { detectOS, type OS } from "@/lib/motion";

const KEY = "motion-hint-dismissed";

export default function MotionHint() {
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(true); // default hidden until checked
  const [os, setOS] = useState<OS>("other");

  useEffect(() => {
    setOS(detectOS(navigator.userAgent));
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  if (!reduced || dismissed) return null;

  const close = () => { localStorage.setItem(KEY, "1"); setDismissed(true); };
  const steps =
    os === "windows"
      ? (lang === "vi"
          ? "Windows: Settings → Accessibility → Visual effects → bật Animation effects."
          : "Windows: Settings → Accessibility → Visual effects → enable Animation effects.")
      : os === "mac"
      ? (lang === "vi"
          ? "macOS: System Settings → Accessibility → Display → tắt Reduce motion."
          : "macOS: System Settings → Accessibility → Display → turn off Reduce motion.")
      : (lang === "vi"
          ? "Windows: bật Animation effects · macOS: tắt Reduce motion (trong Accessibility)."
          : "Windows: enable Animation effects · macOS: turn off Reduce motion (in Accessibility).");

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[95] mx-auto max-w-md border-3 border-ink bg-lime p-3 shadow-brutal-sm md:left-auto">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold">
          {lang === "vi"
            ? "Hệ điều hành đang giảm chuyển động nên bạn sẽ bỏ lỡ animation. "
            : "Your OS has reduced motion on, so you'll miss the animations. "}
          <span className="font-normal">{steps}</span>
        </p>
        <button onClick={close} aria-label={lang === "vi" ? "Đóng" : "Dismiss"} className="shrink-0 border-2 border-ink bg-white px-2 font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}
