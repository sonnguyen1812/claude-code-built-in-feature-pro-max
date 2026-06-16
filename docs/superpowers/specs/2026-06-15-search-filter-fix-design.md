# Design — Search Filter Vanishing-Cards Fix

**Date:** 2026-06-15
**Status:** Approved (pending spec review)
**Topic:** Fix a regression where clearing a search makes a category's cards disappear (only the previously-matched card stays visible).

## Problem

After the wow-animation overhaul, searching for an item then clearing the search
causes the affected category section to render almost empty: only the card that
matched the search stays visible, every other card in that section is invisible.

## Root cause

Three pieces interact:

1. `app/globals.css` hides every `.feature-card` with `opacity: 0` under
   `@media (prefers-reduced-motion: no-preference)` — the FOUC guard so cards don't
   flash before GSAP reveals them.
2. `components/CategorySection.tsx` reveals cards (animates them to `opacity: 1`)
   via a `ScrollTrigger.batch` inside a `useEffect` whose deps are `[reduced]` — so
   it runs **only once at mount**.
3. When the search query changes, `CatalogView` re-renders the category with a
   different card list. Cards use `key={f.id}`, so the previously-matched card keeps
   its DOM node — and the inline `opacity: 1` GSAP set earlier — and stays visible.
   Every other card mounts as a fresh DOM node, hits the CSS `opacity: 0`, and is
   never revealed because the entrance effect does not re-run for the new card set.

Result: only the matched card is visible after clearing the search.

## Decisions (locked with user)

- On filter change, cards should **re-explode** (re-run the entrance animation),
  not appear instantly.
- To keep re-explode smooth while typing, **debounce** the text query (~200ms) so
  the filter (and re-animation) only applies after a typing pause. Kind-filter
  chips remain instant (no debounce).

## Fix

### 1. `components/CategorySection.tsx` — re-run entrance when the card set changes

Split the single effect into two:

- **Title-scrub effect** — deps `[reduced]` (unchanged; the title need not reset on
  filter).
- **Card-explosion effect** — deps `[reduced, idKey]` where
  `const idKey = features.map((f) => f.id).join(",")`.
  - Use `idKey` (a stable string) rather than the `features` array directly:
    `CatalogView` builds the list with `.filter()`, producing a new array reference
    every render, so `[features]` would re-run the effect on every render even when
    contents are unchanged. `idKey` changes only when the set of ids actually changes.
  - On re-run, the previous effect's `ctx.revert()` (cleanup) removes old triggers
    and inline styles; then `gsap.set(cards, { opacity: 0, scale: 0.6, y: 60, rotate })`
    re-hides, and `ScrollTrigger.batch(...)` registers for the current cards.
  - Call `ScrollTrigger.refresh()` after batching so cards already in the viewport
    (the user is looking at the filtered results) explode in immediately rather than
    waiting for a scroll.

### 2. `lib/useDebounced.ts` — small debounce hook

```ts
export function useDebounced<T>(value: T, delay: number): T { ... }
```
Returns `value` after `delay` ms of no change; resets the timer on each change.

### 3. `components/CatalogView.tsx` — debounce the text query

- Keep `query` (instant, bound to the input so typing feels responsive).
- `const debouncedQuery = useDebounced(query, 200)`.
- Filter the features by `debouncedQuery` (not `query`). Kind-filter chips still
  apply instantly.

## Testing & success criteria

- Unit-test `useDebounced` with Vitest fake timers (rapid changes → only the last
  value after the delay).
- Visual behavior verified by `npm run build` (green) + manual check: search → clear
  → the whole section reappears (cards explode in); only-one-item-left bug is gone.
- Check kind chips, language toggle, and `prefers-reduced-motion` (cards show
  immediately, independent of the effect).
- **Success criteria:** search-then-clear shows all cards · fast typing doesn't
  flicker · `npm test` + `npm run build` green · reduced-motion still shows all cards.

## Out of scope (YAGNI)

No search UI redesign, no changes to hover/cursor/page-transition, no data-layer
refactor. Only the vanishing-cards fix plus query debounce.
