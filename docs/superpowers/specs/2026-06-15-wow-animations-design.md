# Design — "Wow" Animation Overhaul

**Date:** 2026-06-15
**Status:** Approved (pending spec review)
**Topic:** Make the Claude Code feature showcase dramatically more animated — explosive, "wow", maximal — while keeping performance guards and accessibility intact.

## Goal

The site today is tasteful but restrained: one entrance animation per element, no
scroll-driven motion, CSS-only hover. The user wants it to feel explosive and
alive. This design adds maximal motion across four signature set-pieces using a
single animation system (GSAP), with strict guards so it stays performant and
accessible.

## Decisions (locked with user)

- **Intensity:** Maximal / explosive.
- **Set-pieces:** all four — hero kinetic typography, scroll-scrub + card
  explosion, cursor + background FX, page transitions.
- **Motion feel:** mixed — snappy/elastic for hero + cards, smooth/cinematic for
  scroll + parallax + page transitions.
- **Approach:** GSAP-centric (Approach A). Bump GSAP to unlock free SplitText +
  ScrollSmoother. No new heavy libraries. Keep Lenis.
- **Accessibility extra:** a dismissible hint banner advising users to enable OS
  animation effects when `prefers-reduced-motion` is active.

## Architecture

### Dependency change

- Bump `gsap` `3.12.7` → `3.13.x`. From 3.13 (April 2025) GreenSock made all
  previously-paid plugins free, including **SplitText** (per-character splitting)
  and **ScrollSmoother**. No other dependency added. Lenis stays as the smooth
  scroller.

### Shared motion layer — `lib/motion.ts`

A single place to register plugins and export easing/duration tokens so "feel" is
consistent and tunable from one file.

```ts
export const EASE = {
  snap:    "back.out(2)",         // hero + cards: bouncy, decisive
  elastic: "elastic.out(1,0.5)",  // small accents, badges
  smooth:  "power3.out",          // scroll reveals
  cinematic: "expo.out",          // page transitions
  scrub:   "none",                // linear, tied to scroll progress
} as const;

export const DUR = { fast: 0.35, base: 0.6, slow: 1.0 } as const;

export function registerMotion() { /* registerPlugin once, client-only */ }
```

Rationale: components currently hard-code easing/duration. Centralizing keeps the
mixed feel coherent (snappy for hero/cards, smooth for scroll/transitions) and
makes global tuning a one-file change.

### New files (existing components upgraded in place, not rewritten)

```
lib/motion.ts                 ← easing/duration tokens + registerMotion()
components/motion/
  ├─ Cursor.tsx               ← follower dot + hover grow (desktop, pointer:fine)
  ├─ Magnetic.tsx             ← wrapper that pulls cursor toward a button/link
  ├─ BackgroundFX.tsx         ← thin brutalist grid, parallax to mouse + scroll
  ├─ PageTransition.tsx       ← ink wipe overlay between routes
  └─ MotionHint.tsx           ← dismissible banner: enable OS animation effects
```

Upgraded in place: `Hero`, `AnimateOnScroll` (becomes the card-explosion driver),
`CategorySection`, `FeatureCard`, `CopyBlock`, `FeatureDetail`, `layout.tsx`.

## Set-pieces

### A. Hero kinetic typography (`Hero.tsx`)

- **SplitText** splits "CLAUDE CODE" + the highlighted label into characters.
- Entrance: chars rise (`y:100, rotateX:-90`) with a wave stagger on `back.out(2)`
  (snappy) — letters "stand up" one by one.
- Keep the fixed shadow slam (box-shadow only, no opacity conflict). Add a single
  brand gradient sweep across the highlighted block.
- After entrance: a very light idle micro-loop (label rocks ±0.5° yoyo) so the
  hero never feels dead. Disabled under reduced-motion.
- `SplitText.revert()` after the timeline so the DOM returns to clean text
  (a11y + static-export SEO).

### B. Scroll-scrub + card explosion (`CategorySection`, `FeatureCard`, `AnimateOnScroll`)

- Each category title **pins** briefly on scroll-in; text scale + shadow grow tied
  to `scrub`.
- Card grid replaces fade-up with **explosion-in**: each card
  `scale:0.6→1, rotate: random(-8,8)→0, y:60→0, opacity:0→1`, grid-wave stagger
  from a corner, `back.out`.
- Card hover: **3D tilt** from pointer position (small rotateX/Y) + accent glow
  (category-colored box-shadow) + stronger lift toward the shadow. Driven by
  `gsap.quickTo` for smoothness.

### C. Cursor + background FX (`Cursor.tsx`, `Magnetic.tsx`, `BackgroundFX.tsx`)

- **Custom cursor:** ink-bordered dot following the pointer (quickTo); grows and
  recolors over links/buttons/cards.
- **Magnetic:** lang toggle, copy button, "All features" link, filter chips pull
  the cursor gently toward center.
- **Background:** thin brutalist grid over `paper`, subtle parallax to mouse +
  scroll for depth. Not loud.
- **Entire section C runs only on desktop with a mouse** (`pointer: fine`); mobile
  keeps the native cursor and skips the grid parallax.

### D. Page transitions (`PageTransition.tsx`, `FeatureDetail.tsx`)

- Route change (home ↔ detail): an `ink` block **wipes** across, content swaps,
  wipe retracts. GSAP timeline hooked to `usePathname`.
- Detail entrance: title + sections **stagger** in; code blocks **typewriter**
  per-character for Usage/Example.
- Smooth/cinematic feel here (expo/power, no elastic) to avoid dizziness on
  navigation.

## Guards, performance & accessibility

### Reduced-motion (highest priority)

- `prefers-reduced-motion: reduce` disables **all** set-pieces: hero shows plainly
  (no split), cards fade lightly or appear instantly, no custom cursor, no
  background parallax, page transition becomes an instant cross-fade. Reuses the
  existing `useReducedMotion` hook + CSS guard, extended to the new pieces.
- The custom cursor never replaces the focus ring — keyboard users keep a clear
  outline; the cursor is a decorative overlay only.

### MotionHint banner (`MotionHint.tsx`)

- Shows **only when** `prefers-reduced-motion: reduce` is active (i.e. the user
  won't see the effects).
- Small neo-brutalist banner (`border-3`, `shadow-brutal-sm`, `bg-lime`),
  dismissible; dismissal persisted in `localStorage` so it never nags again.
- Bilingual, with OS-specific guidance detected via `navigator.userAgent`
  (fallback: show both):
  - **Windows:** Settings → Accessibility → Visual effects → enable
    **Animation effects**.
  - **macOS:** System Settings → Accessibility → Display → turn off
    **Reduce motion**.
- Suggestion only — never toggles anything. If the user genuinely needs reduced
  motion, dismissing the banner is enough.

### Performance (maximal motion needs discipline)

- Animate only `transform` / `opacity` / `box-shadow`; add `will-change` where
  needed and remove it after.
- `SplitText.revert()` returns clean DOM after use.
- Cursor / magnetic / background share **one** rAF loop and use `gsap.quickTo`
  (no tween allocated per mousemove).
- ScrollTrigger `pin` uses `anticipatePin`, refreshes on resize; every trigger is
  `kill()`-ed on unmount via `gsap.context().revert()`.
- Mobile disables cursor / background / heavy pins to spare weaker devices.

## Testing & success criteria

- Data-layer tests (Vitest) are untouched; re-run to confirm nothing broke.
- Add unit tests for `lib/motion.ts` (token values) and pure logic (tilt-from-
  pointer math, easing selection under reduced-motion) — the parts testable
  without a real DOM.
- Visual animation is not unit-tested; verified via `next build` (static export
  must pass) + manual dev review + confirming the reduced-motion path doesn't
  crash.
- **Success criteria:** `npm run build` green · `npm test` green · no hydration
  errors · reduced-motion fully silences motion · mobile layout intact.

## Out of scope (YAGNI)

- No content/data changes. No color or neo-brutalist layout changes. No sound. No
  data-layer refactor. No new heavy dependencies beyond the GSAP bump.


