# Wow Animation Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the restrained Claude Code feature showcase into an explosive, maximally-animated experience using a single GSAP system, with strict reduced-motion and performance guards.

**Architecture:** Bump GSAP to 3.13 to unlock free SplitText. Centralize easing/duration tokens and pure helpers in a gsap-free `lib/motion.ts` (so they're unit-testable). Upgrade existing components in place for hero kinetic typography, scroll-scrub card explosion, and 3D-tilt hover. Add new `components/motion/*` for custom cursor, magnetic buttons, background parallax, page-transition wipe, and a reduced-motion hint banner. Keep Lenis as the smooth scroller. Follow the existing per-module `gsap.registerPlugin` pattern (see `AnimateOnScroll.tsx:7`).

**Tech Stack:** Next.js 15 (static export), React 19, TypeScript, GSAP 3.13 (+ SplitText, ScrollTrigger), Lenis, Tailwind, Vitest + Testing Library (jsdom).

---

## File Structure

**Pure / testable (no gsap import):**
- `lib/motion.ts` — `EASE`, `DUR` tokens + pure helpers `detectOS`, `tiltFromPointer`, `clamp`.

**New client components:**
- `components/motion/Cursor.tsx` — follower dot, grows over interactive targets (desktop only).
- `components/motion/Magnetic.tsx` — wrapper that pulls its child toward the pointer.
- `components/motion/BackgroundFX.tsx` — thin brutalist grid, parallax to mouse + scroll.
- `components/motion/PageTransition.tsx` — ink wipe reveal on route change.
- `components/motion/MotionHint.tsx` — dismissible banner advising OS animation settings.

**Upgraded in place:**
- `components/Hero.tsx` — SplitText kinetic typography.
- `components/CategorySection.tsx` — card explosion + title pin-scrub.
- `components/FeatureCard.tsx` — 3D tilt + glow hover; gains `feature-card` class.
- `components/CopyBlock.tsx` — optional typewriter reveal.
- `components/FeatureDetail.tsx` — staggered entrance + typewriter code.
- `app/layout.tsx` — mount Cursor, BackgroundFX, PageTransition, MotionHint.
- `package.json` — gsap bump.

---

### Task 1: Bump GSAP to unlock SplitText

**Files:**
- Modify: `package.json:14`

- [ ] **Step 1: Update the gsap version**

In `package.json`, change the dependency:

```json
    "gsap": "3.13.0",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: lockfile updates, `node_modules/gsap/dist/SplitText.js` now exists.

- [ ] **Step 3: Verify SplitText is present**

Run: `node -e "console.log(require('gsap/dist/SplitText.js') ? 'ok' : 'missing')"`
Expected: prints `ok` (SplitText ships free from 3.13).

- [ ] **Step 4: Confirm build still passes**

Run: `npm run build`
Expected: build completes, static export succeeds.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: bump gsap to 3.13 for free SplitText"
```

---
- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — cannot resolve `./motion`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/motion.ts
export const EASE = {
  snap: "back.out(2)",
  elastic: "elastic.out(1,0.5)",
  smooth: "power3.out",
  cinematic: "expo.out",
  scrub: "none",
} as const;

export const DUR = { fast: 0.35, base: 0.6, slow: 1.0 } as const;

export type OS = "windows" | "mac" | "other";

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function detectOS(ua: string): OS {
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "other";
}

/**
 * Map a pointer position within an element to a 3D tilt.
 * Pointer toward the top => positive rotateX; toward the right => positive rotateY.
 * Returns 0/0 at the element center.
 */
export function tiltFromPointer(
  px: number, py: number, w: number, h: number, maxDeg: number
): { rotateX: number; rotateY: number } {
  const nx = (px / w) * 2 - 1; // -1..1, left..right
  const ny = (py / h) * 2 - 1; // -1..1, top..bottom
  return {
    rotateY: clamp(nx, -1, 1) * maxDeg,
    rotateX: clamp(-ny, -1, 1) * maxDeg,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS (all 9 assertions).

- [ ] **Step 5: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts
git commit -m "feat: pure motion tokens and helpers with tests"
```

---

### Task 3: Hero kinetic typography (`Hero.tsx`)

Split the two heading spans into characters and animate them rising with a wave
stagger. Keep the working shadow slam. Add a brand gradient sweep and a tiny idle
loop. Fully bypassed under reduced-motion.

**Files:**
- Modify: `components/Hero.tsx` (full replace)

- [ ] **Step 1: Replace Hero.tsx with the kinetic version**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, DUR } from "@/lib/motion";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

export default function Hero() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const heads = gsap.utils.toArray<HTMLElement>(".hero-kinetic");
      const splits = heads.map((el) => new SplitText(el, { type: "chars" }));
      const chars = splits.flatMap((s) => s.chars);

      const tl = gsap.timeline();
      tl.from(chars, {
        yPercent: 120, rotateX: -90, opacity: 0,
        duration: DUR.base, ease: EASE.snap, stagger: 0.025,
      });
      tl.from(".hero-line", { y: 40, opacity: 0, duration: DUR.base, ease: EASE.smooth }, "-=0.3");
      tl.fromTo(".hero-shadow",
        { boxShadow: "0px 0px 0px 0px rgba(10,10,10,1)" },
        { boxShadow: "10px 10px 0px 0px rgba(10,10,10,1)", duration: DUR.fast, ease: EASE.smooth },
        "-=0.4");
      tl.fromTo(".hero-sweep",
        { backgroundPosition: "-150% 0" },
        { backgroundPosition: "250% 0", duration: 0.9, ease: "power2.inOut" },
        "-=0.2");

      // Light idle loop so the hero never feels static.
      gsap.to(".hero-shadow", {
        rotate: 0.5, duration: 2.2, ease: "sine.inOut",
        yoyo: true, repeat: -1, transformOrigin: "center",
      });

      return () => splits.forEach((s) => s.revert());
    }, root);
    return () => ctx.revert();
  }, [reduced, lang]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
        <span className="hero-kinetic block [perspective:600px]">CLAUDE CODE</span>
        <span className="hero-kinetic hero-shadow hero-sweep mt-2 inline-block border-3 border-ink bg-brand bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] bg-[length:250%_100%] px-3 shadow-brutal-lg [perspective:600px]">
          {lang === "vi" ? "TOÀN BỘ TÍNH NĂNG" : "EVERY FEATURE"}
        </span>
      </h1>
      <p className="hero-line mt-6 max-w-xl text-lg md:text-xl">
        {lang === "vi"
          ? "Khám phá hệ sinh thái Claude Code: lệnh, skills, workflows, agents và hơn thế. Bấm vào từng cái để hiểu sâu và dùng được ngay."
          : "Explore the Claude Code ecosystem: commands, skills, workflows, agents and more. Click any item to deep-dive and start using it."}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build to confirm no type/SSR errors**

Run: `npm run build`
Expected: build passes; `/` prerenders without "SplitText is not a function".

- [ ] **Step 3: Manual check (dev)**

Run: `npm run dev`, open `/`.
Expected: characters rise in a wave on load; shadow slams; gradient sweeps once;
label gently rocks. Toggle OS reduce-motion → text appears instantly, no motion.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: hero kinetic typography with SplitText"
```

---

### Task 4: Card explosion + title scrub (`CategorySection.tsx`)

Replace the per-card `AnimateOnScroll` fade-up with a single grid-wave explosion
driven by `ScrollTrigger.batch`, and give the category title a scrub-linked scale.
`AnimateOnScroll` stays in the repo (still used elsewhere), so don't delete it.

**Files:**
- Modify: `components/CategorySection.tsx` (full replace)

- [ ] **Step 1: Replace CategorySection.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category, Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, DUR } from "@/lib/motion";
import FeatureCard from "./FeatureCard";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function CategorySection({
  category, features,
}: {
  category: Category;
  features: Feature[];
}) {
  const { t } = useLang();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const accent = { brand: "bg-brand", lime: "bg-lime", sky: "bg-sky", pink: "bg-pink" }[category.accent];

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      gsap.set(cards, { opacity: 0, scale: 0.6, y: 60, rotate: () => gsap.utils.random(-8, 8) });
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1, scale: 1, y: 0, rotate: 0,
            duration: DUR.base, ease: EASE.snap,
            stagger: { each: 0.06, grid: "auto", from: "start" },
          }),
      });

      const title = root.current!.querySelector(".cat-title");
      if (title) {
        gsap.fromTo(title, { scale: 0.85 }, {
          scale: 1, ease: EASE.scrub,
          scrollTrigger: { trigger: title, start: "top 90%", end: "top 55%", scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id={category.id} className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className={`cat-title inline-block border-3 border-ink ${accent} px-3 py-1 shadow-brutal-sm`}>
        <h2 className="text-2xl font-black uppercase">{t(category.label)}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-lg">{t(category.blurb)}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: passes. (The `AnimateOnScroll` import is removed from this file — that's
intended; the component itself is not deleted.)

- [ ] **Step 3: Manual check (dev)**

Scroll the catalog. Expected: cards pop in (scale-up + de-rotate) in a grid wave;
category titles scale slightly as they enter. Reduce-motion → cards present
instantly, no transform.

- [ ] **Step 4: Commit**

```bash
git add components/CategorySection.tsx
git commit -m "feat: scroll-driven card explosion and title scrub"
```

---

### Task 5: 3D tilt + glow hover (`FeatureCard.tsx`)

Add the `feature-card` class (the explosion in Task 4 targets it) and a pointer-
driven 3D tilt with an accent glow, using `gsap.quickTo` for smooth tracking.
Tilt uses the pure `tiltFromPointer` helper from Task 2.

**Files:**
- Modify: `components/FeatureCard.tsx` (full replace)

- [ ] **Step 1: Replace FeatureCard.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import type { Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { tiltFromPointer } from "@/lib/motion";

const KIND_STYLE: Record<FeatureKind, string> = {
  command: "bg-brand", skill: "bg-lime", workflow: "bg-sky", flag: "bg-pink", subcommand: "bg-white",
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      const rx = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power3.out" });
      const ry = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const { rotateX, rotateY } = tiltFromPointer(e.clientX - r.left, e.clientY - r.top, r.width, r.height, 8);
        rx(rotateX); ry(rotateY);
      };
      const onEnter = () => gsap.to(el, { scale: 1.03, boxShadow: "10px 10px 0 0 #0A0A0A", duration: 0.3, ease: "power3.out" });
      const onLeave = () => { rx(0); ry(0); gsap.to(el, { scale: 1, boxShadow: "6px 6px 0 0 #0A0A0A", duration: 0.4, ease: "power3.out" }); };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <Link
      ref={ref}
      href={`/feature/${feature.id}`}
      className="feature-card group block border-3 border-ink bg-white p-4 shadow-brutal [transform-style:preserve-3d] [perspective:600px] will-change-transform"
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
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: passes; `ref` on `next/link` compiles (Link forwards refs in React 19).

- [ ] **Step 3: Manual check (dev)**

Hover a card on desktop. Expected: card tilts toward the cursor, lifts/scales, glow
shadow grows; resets smoothly on leave. Reduce-motion → no JS hover; the static CSS
card remains.

- [ ] **Step 4: Commit**

```bash
git add components/FeatureCard.tsx
git commit -m "feat: 3D tilt and glow hover on feature cards"
```

---

### Task 6: Custom cursor + Magnetic wrapper (`Cursor.tsx`, `Magnetic.tsx`)

Desktop-only follower dot that grows over interactive targets, plus a wrapper that
pulls its child toward the pointer. Both guard on `pointer: fine` and reduced-motion.

**Files:**
- Create: `components/motion/Cursor.tsx`
- Create: `components/motion/Magnetic.tsx`

- [ ] **Step 1: Create Cursor.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !dot.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = dot.current;
    const x = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    const move = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("a,button,input,[role=button]");
    const over = (e: PointerEvent) =>
      gsap.to(el, { scale: isInteractive(e.target) ? 2.4 : 1, backgroundColor: isInteractive(e.target) ? "#D97706" : "transparent", duration: 0.2 });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 1 });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [reduced]);

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-5 w-5 rounded-full border-3 border-ink opacity-0 mix-blend-difference"
    />
  );
}
```

- [ ] **Step 2: Create Magnetic.tsx**

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Magnetic({ children, strength = 0.4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const reset = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, [reduced, strength]);

  return <span ref={ref} className="inline-block">{children}</span>;
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passes (both are client components, no SSR-only APIs at module scope).

- [ ] **Step 4: Manual check (dev)**

Mount `<Cursor />` (Task 9 wires it). Expected on desktop: dot follows pointer,
grows over links/buttons. On touch device / reduce-motion: nothing renders/moves,
native cursor stays.

- [ ] **Step 5: Commit**

```bash
git add components/motion/Cursor.tsx components/motion/Magnetic.tsx
git commit -m "feat: custom cursor and magnetic wrapper"
```

---

### Task 7: Background parallax grid (`BackgroundFX.tsx`)

A fixed, thin brutalist grid behind all content that drifts subtly with the mouse
and scroll. Desktop + motion only; on touch / reduced-motion it renders a static
grid (or nothing) with no listeners.

**Files:**
- Create: `components/motion/BackgroundFX.tsx`

- [ ] **Step 1: Create BackgroundFX.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function BackgroundFX() {
  const grid = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !grid.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = grid.current;
    const xTo = gsap.quickTo(el, "x", { duration: 1.2, ease: "power2.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 1.2, ease: "power2.out" });
    const move = (e: PointerEvent) => {
      xTo((e.clientX / window.innerWidth - 0.5) * 30);
      yTo((e.clientY / window.innerHeight - 0.5) * 30);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);

  return (
    <div
      ref={grid}
      aria-hidden
      className="pointer-events-none fixed inset-[-30px] -z-10 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(#0A0A0A 1px, transparent 1px), linear-gradient(90deg, #0A0A0A 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 3: Manual check (dev)**

Once mounted (Task 9). Expected: faint grid behind content shifts gently with the
mouse. Reduce-motion / touch → grid static or absent, no listeners.

- [ ] **Step 4: Commit**

```bash
git add components/motion/BackgroundFX.tsx
git commit -m "feat: parallax brutalist grid background"
```

---

### Task 8: Page transition wipe (`PageTransition.tsx`)

An ink overlay wipes across on every route change, then retracts to reveal the new
page. Driven by `usePathname`. Under reduced-motion it does nothing (instant
content swap). Cinematic easing.

**Files:**
- Create: `components/motion/PageTransition.tsx`

- [ ] **Step 1: Create PageTransition.tsx**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE } from "@/lib/motion";

export default function PageTransition() {
  const overlay = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; } // skip initial load
    if (reduced || !overlay.current) return;
    const el = overlay.current;
    gsap.killTweensOf(el);
    const tl = gsap.timeline();
    tl.set(el, { scaleX: 0, transformOrigin: "left center", opacity: 1 });
    tl.to(el, { scaleX: 1, duration: 0.35, ease: EASE.cinematic });
    tl.set(el, { transformOrigin: "right center" });
    tl.to(el, { scaleX: 0, duration: 0.4, ease: EASE.cinematic });
    tl.set(el, { opacity: 0 });
  }, [pathname, reduced]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] origin-left scale-x-0 bg-ink opacity-0"
    />
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: passes; `usePathname` is allowed in a client component.

- [ ] **Step 3: Manual check (dev)**

Navigate home → a feature → back. Expected: ink panel sweeps across between pages.
Reduce-motion → instant swap, no panel.

- [ ] **Step 4: Commit**

```bash
git add components/motion/PageTransition.tsx
git commit -m "feat: ink wipe page transition"
```

---

### Task 9: MotionHint banner (`MotionHint.tsx`)

Shows ONLY when `prefers-reduced-motion: reduce` is active, advising the user how
to enable OS animation effects. Dismissible, persisted in `localStorage`. Uses the
pure `detectOS` helper from Task 2.

**Files:**
- Create: `components/motion/MotionHint.tsx`

- [ ] **Step 1: Create MotionHint.tsx**

```tsx
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
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 3: Manual check (dev)**

With OS reduce-motion ON → banner appears with the correct per-OS instructions;
✕ dismisses and it stays gone on reload. With reduce-motion OFF → never appears.

- [ ] **Step 4: Commit**

```bash
git add components/motion/MotionHint.tsx
git commit -m "feat: reduced-motion hint banner with OS guidance"
```

---

### Task 10: Mount motion components + magnetic header (`layout.tsx`, `Header.tsx`)

Mount the global motion components once, inside the providers so they can read lang
/ pathname. Wrap the header logo + toggle in `Magnetic`.

**Files:**
- Modify: `app/layout.tsx` (full replace)
- Modify: `components/Header.tsx` (full replace)

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Cursor from "@/components/motion/Cursor";
import BackgroundFX from "@/components/motion/BackgroundFX";
import PageTransition from "@/components/motion/PageTransition";
import MotionHint from "@/components/motion/MotionHint";

const sans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Claude Code — Every Feature",
  description: "A bilingual showcase of the Claude Code CLI ecosystem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>
          <BackgroundFX />
          <Cursor />
          <PageTransition />
          <SmoothScroll>
            <Header />
            {children}
          </SmoothScroll>
          <MotionHint />
        </LanguageProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace components/Header.tsx**

```tsx
"use client";
import Link from "next/link";
import LangToggle from "./LangToggle";
import Magnetic from "./motion/Magnetic";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b-3 border-ink bg-paper px-4 py-3 md:px-8">
      <Magnetic>
        <Link href="/" className="text-xl font-black tracking-tight">
          CLAUDE<span className="text-brand">·</span>CODE
        </Link>
      </Magnetic>
      <Magnetic>
        <LangToggle />
      </Magnetic>
    </header>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passes; all four motion components prerender without window access at
module scope (they guard inside `useEffect`).

- [ ] **Step 4: Manual check (dev)**

Full page. Expected on desktop: custom cursor, faint moving grid, magnetic header,
page wipe on navigation — all together, no console errors, no hydration mismatch.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/Header.tsx
git commit -m "feat: mount motion layer and magnetic header"
```

---

### Task 11: Detail stagger + typewriter code (`CopyBlock.tsx`, `FeatureDetail.tsx`)

Stagger the detail page content in, and type the first code block character-by-
character. Copy behavior is preserved. Reduced-motion shows everything instantly.

**Files:**
- Modify: `components/CopyBlock.tsx` (full replace)
- Modify: `components/FeatureDetail.tsx:7-13` (animate the article children)

- [ ] **Step 1: Replace CopyBlock.tsx (adds optional typewriter)**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function CopyBlock({ code, typewriter = false }: { code: string; typewriter?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(typewriter ? "" : code);
  const reduced = useReducedMotion();
  const codeRef = useRef<HTMLElement>(null);

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
        <code ref={codeRef}>{shown}</code>
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
```

- [ ] **Step 2: Animate FeatureDetail children**

In `components/FeatureDetail.tsx`, add imports at the top (after the existing
imports on lines 1-5):

```tsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DUR, EASE } from "@/lib/motion";
```

Replace the component signature line `export default function FeatureDetail({ feature }: { feature: Feature }) {`
and the opening `const { t, lang } = useLang();` with:

```tsx
export default function FeatureDetail({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(root.current!.children, {
        y: 30, opacity: 0, duration: DUR.base, ease: EASE.smooth, stagger: 0.08,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, feature.id]);
```

Add the `ref` to the article element — change `<article className="mx-auto max-w-3xl px-4 py-10 md:px-8">`
to `<article ref={root} className="mx-auto max-w-3xl px-4 py-10 md:px-8">`.

Enable typewriter on the Usage block only — change the Usage `<CopyBlock code={feature.usage} />`
to `<CopyBlock code={feature.usage} typewriter />` (leave the Example block as-is).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 4: Manual check (dev)**

Open a feature page. Expected: content staggers in; Usage code types out; copy still
works (copies full code even mid-type). Reduce-motion → everything instant, full code.

- [ ] **Step 5: Commit**

```bash
git add components/CopyBlock.tsx components/FeatureDetail.tsx
git commit -m "feat: detail stagger entrance and typewriter usage block"
```

---

### Task 12: Full verification + deploy

Confirm the whole suite passes, motion is fully gated, and ship via the existing
auto-deploy (push to `master` → Vercel production).

**Files:** none (verification + git only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all Vitest files green (data-layer + i18n + `lib/motion.test.ts`).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: static export succeeds, no type errors, no "window is not defined".

- [ ] **Step 3: Reduced-motion smoke check**

In the browser devtools, emulate `prefers-reduced-motion: reduce` and reload `/`
and a feature page.
Expected: no hero split, no card explosion, no cursor, no grid drift, no page wipe;
MotionHint banner appears; content fully visible and usable.

- [ ] **Step 4: Mobile smoke check**

Emulate a touch device (no `pointer: fine`).
Expected: layout intact, no custom cursor, no grid parallax; cards/hero still
animate on scroll/load (those aren't pointer-gated); no console errors.

- [ ] **Step 5: Push to deploy**

```bash
git push
```
Expected: push to `master` triggers a Vercel production deploy; the site at
`claude-code-built-in-feature-pro-max.vercel.app` updates within ~30s.

- [ ] **Step 6: Verify live**

Open the live URL.
Expected: animations play on desktop; reduced-motion users see the hint banner;
no runtime errors.

---

## Self-Review Notes

- **Spec coverage:** Hero kinetic typo → Task 3 · scroll-scrub + card explosion →
  Tasks 4-5 · cursor + magnetic + background → Tasks 6-7, mounted in 10 · page
  transitions → Task 8 · detail stagger + typewriter → Task 11 · MotionHint banner
  → Task 9 · reduced-motion + performance guards → present in every task + Task 12 ·
  GSAP bump → Task 1 · motion tokens/helpers → Task 2. All spec sections covered.
- **No placeholders:** every code step has full code; commands have expected output.
- **Type consistency:** `EASE`/`DUR`/`detectOS`/`tiltFromPointer`/`clamp` defined in
  Task 2 and used with matching signatures in Tasks 3-11. `feature-card` class
  introduced in Task 5 is the exact selector targeted in Task 4. `typewriter` prop
  added to `CopyBlock` in Task 11 and used in the same task.












### Task 2: Pure motion tokens + helpers (`lib/motion.ts`)

This file holds easing/duration tokens and pure helper functions. No gsap import,
so it's fully unit-testable in jsdom.

**Files:**
- Create: `lib/motion.ts`
- Test: `lib/motion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/motion.test.ts
import { describe, it, expect } from "vitest";
import { EASE, DUR, clamp, detectOS, tiltFromPointer } from "./motion";

describe("motion tokens", () => {
  it("exposes the mixed-feel easing set", () => {
    expect(EASE.snap).toBe("back.out(2)");
    expect(EASE.smooth).toBe("power3.out");
    expect(EASE.cinematic).toBe("expo.out");
  });
  it("exposes durations", () => {
    expect(DUR.base).toBe(0.6);
  });
});

describe("clamp", () => {
  it("clamps within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("detectOS", () => {
  it("detects windows", () => {
    expect(detectOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
  });
  it("detects mac", () => {
    expect(detectOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)")).toBe("mac");
  });
  it("falls back to other", () => {
    expect(detectOS("Mozilla/5.0 (X11; Linux x86_64)")).toBe("other");
  });
});

describe("tiltFromPointer", () => {
  it("returns zero tilt at center", () => {
    const t = tiltFromPointer(50, 50, 100, 100, 8);
    expect(t.rotateX).toBeCloseTo(0);
    expect(t.rotateY).toBeCloseTo(0);
  });
  it("tilts opposite on each axis toward the pointer edge", () => {
    const t = tiltFromPointer(100, 0, 100, 100, 8);
    // pointer top-right: rotateY positive (right), rotateX positive (top)
    expect(t.rotateY).toBeCloseTo(8);
    expect(t.rotateX).toBeCloseTo(8);
  });
});
```


