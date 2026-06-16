# Search Filter Vanishing-Cards Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the regression where clearing a search leaves a category showing only the previously-matched card, by re-running the card entrance animation when the rendered card set changes, and debouncing the text query so the re-explode stays smooth while typing.

**Architecture:** Split `CategorySection`'s single mount-only effect into a title-scrub effect (deps `[reduced]`) and a card-explosion effect keyed on a stable `idKey` derived from the feature ids (deps `[reduced, idKey]`), calling `ScrollTrigger.refresh()` after re-batching so in-viewport cards reveal immediately. Add a small `useDebounced` hook and use it in `CatalogView` so the text filter applies ~200ms after the last keystroke; kind chips stay instant.

**Tech Stack:** Next.js 15 (static export), React 19, TypeScript, GSAP 3.13 (ScrollTrigger), Vitest + Testing Library (jsdom, fake timers).

---

## File Structure

- `lib/useDebounced.ts` — new. A single hook `useDebounced<T>(value, delay): T` returning the value after `delay` ms of no change. One clear responsibility, no deps beyond React.
- `lib/useDebounced.test.ts` — new. Vitest fake-timer tests for the hook.
- `components/CatalogView.tsx` — modify. Add `debouncedQuery = useDebounced(query, 200)`; filter by `debouncedQuery` instead of `query`. Input still bound to `query`.
- `components/CategorySection.tsx` — modify. Split effects; card effect re-runs on `idKey`; add `ScrollTrigger.refresh()`.

---

### Task 1: `useDebounced` hook (TDD)

A hook that returns its input after `delay` ms of no change, resetting the timer on
each change. Pure logic + a timer, fully testable with Vitest fake timers.

**Files:**
- Create: `lib/useDebounced.ts`
- Test: `lib/useDebounced.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/useDebounced.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDebounced } from "./useDebounced";

describe("useDebounced", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    expect(result.current).toBe("a");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    vi.advanceTimersByTime(150);
    expect(result.current).toBe("a");
  });

  it("updates to the latest value after the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    vi.advanceTimersByTime(200);
    expect(result.current).toBe("ab");
  });

  it("only emits the final value when changes arrive faster than the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    vi.advanceTimersByTime(100);
    rerender({ v: "abc" });
    vi.advanceTimersByTime(100);
    expect(result.current).toBe("a"); // timer reset by second change, not yet elapsed
    vi.advanceTimersByTime(100);
    expect(result.current).toBe("abc"); // final value after full delay from last change
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/useDebounced.test.ts`
Expected: FAIL — cannot resolve `./useDebounced`.

- [ ] **Step 3: Implement the hook**

```ts
// lib/useDebounced.ts
import { useEffect, useState } from "react";

export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/useDebounced.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/useDebounced.ts lib/useDebounced.test.ts
git commit -m "feat: add useDebounced hook with tests"
```

---

### Task 2: Debounce the text query in `CatalogView.tsx`

Apply the text filter ~200ms after the last keystroke so the re-explode stays
smooth. The input stays bound to `query` (instant typing); only the filtering uses
the debounced value. Kind chips stay instant.

**Files:**
- Modify: `components/CatalogView.tsx`

- [ ] **Step 1: Add the import**

At the top of `components/CatalogView.tsx`, after the existing
`import { useLang } from "@/lib/i18n";` line, add:

```tsx
import { useDebounced } from "@/lib/useDebounced";
```

- [ ] **Step 2: Derive the debounced query**

Immediately after the line `const [active, setActive] = useState<Set<FeatureKind>>(new Set());`,
add:

```tsx
  const debouncedQuery = useDebounced(query, 200);
```

- [ ] **Step 3: Filter by the debounced query**

In the `useMemo` filter, change the first line from:

```tsx
    const q = query.trim().toLowerCase();
```

to:

```tsx
    const q = debouncedQuery.trim().toLowerCase();
```

And change the `useMemo` dependency array from `[features, query, active]` to:

```tsx
  }, [features, debouncedQuery, active]);
```

(The `<input>` element stays bound to `query`/`setQuery` — do not change the
SearchFilter props. Typing remains instant; only the filtering is debounced.)

- [ ] **Step 4: Build to confirm it compiles**

Run: `npm run build`
Expected: passes (120 pages).

- [ ] **Step 5: Commit**

```bash
git add components/CatalogView.tsx
git commit -m "feat: debounce search query so filtering stays smooth"
```

---
<!-- PLAN-APPEND -->

### Task 3: Re-run card entrance on filter change (`CategorySection.tsx`)

Split the single mount-only effect into a title-scrub effect (deps `[reduced]`) and
a card-explosion effect keyed on a stable `idKey` (deps `[reduced, idKey]`). On
re-run, `ctx.revert()` clears old triggers/styles, cards are re-hidden and
re-batched, and `ScrollTrigger.refresh()` makes in-viewport cards explode in
immediately. This fixes the vanishing-cards bug: when the filtered set changes,
`idKey` changes and every current card is revealed.

**Files:**
- Modify: `components/CategorySection.tsx` (full replace)

- [ ] **Step 1: Replace `components/CategorySection.tsx` with exactly this content**

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
  const idKey = features.map((f) => f.id).join(",");

  // Card explosion — re-runs whenever the rendered card set changes (idKey).
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const cards = Array.from(root.current!.querySelectorAll<HTMLElement>(".feature-card"));
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
      ScrollTrigger.refresh();
    }, root);
    return () => ctx.revert();
  }, [reduced, idKey]);

  // Title scrub — independent of filtering, runs once per mount.
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
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
Expected: passes (120 pages), no type errors.

- [ ] **Step 3: Manual verification of the bug fix**

Run: `npm run dev`. On `/`: type a query that matches one item in a section, then
clear the query. Expected: the whole section's cards reappear (explode in) — NOT
just the previously-matched card. Type fast and confirm no flicker (debounce from
Task 2). Toggle a kind chip and confirm cards re-reveal. Toggle OS reduced-motion and
confirm all cards show immediately (no dependence on the effect).

- [ ] **Step 4: Commit**

```bash
git add components/CategorySection.tsx
git commit -m "fix: re-run card entrance when filtered set changes"
```

---

## Self-Review Notes

- **Spec coverage:** Fix #1 (re-run entrance on idKey + ScrollTrigger.refresh + split
  title effect) → Task 3. Fix #2 (useDebounced hook) → Task 1. Fix #3 (debounced query
  in CatalogView) → Task 2. Testing → Task 1 (hook unit tests) + Task 3 Step 3 (manual).
  All spec sections covered.
- **No placeholders:** every code step has full code; commands have expected output.
- **Type consistency:** `useDebounced<T>(value, delay): T` defined in Task 1, used in
  Task 2 with matching signature. `idKey` (string) introduced and used within Task 3.
  Existing `EASE`/`DUR`/`FeatureCard`/`.feature-card` references unchanged from the
  current codebase.
- **Ordering note:** Task 2 imports `useDebounced` (Task 1) — Task 1 must precede
  Task 2. Task 3 is independent of 1–2 (can run any order), but listed last as the
  core fix.



