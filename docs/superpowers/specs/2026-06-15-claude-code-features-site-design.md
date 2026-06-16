# Claude Code Features Showcase — Design Spec

**Date:** 2026-06-15
**Status:** Approved (sections 1–3)
**Author:** Kiro (brainstorming session with daddy)

## 1. Purpose & Goals

Build a visually striking public **showcase website** that catalogs the entire
Claude Code CLI ecosystem (slash commands, skills, subagents, agent teams,
workflows, hooks, MCP, configuration) in an easy-to-understand way. Each feature
can be **deep-dived** to learn what it is, when to use it, and how to use it.
The site is then **deployed to Vercel**.

**Success criteria:**
- Visitor can grasp the whole ecosystem from the landing page in one scroll.
- Visitor can click any feature and read a focused deep-dive (what / when / how).
- Content is bilingual (VI/EN) with a header toggle.
- Site has a strong "wow" factor via GSAP scroll animation + neo-brutalist art direction.
- Site builds to static files and deploys to Vercel.

**Audience:** Public / community. Tone: confident, clear, developer-facing.

## 2. Decisions (locked)

| Decision | Choice |
|----------|--------|
| Primary purpose | Public, visually impressive showcase |
| Content scope | Full Claude Code ecosystem |
| Language | Bilingual VI/EN with toggle |
| Deploy target | Vercel |
| Stack | Next.js 15 (App Router, static export) + Tailwind + GSAP + ScrollTrigger + Lenis |
| Art direction | Neo-brutalism (thick black borders, hard shadows, bold block colors, light/beige background) |
| i18n | Per-field `{ vi, en }`, toggle persisted to localStorage |

## 3. Architecture

```
Next.js 15 (App Router, output: "export")
├── Tailwind CSS         → neo-brutalist design tokens (color / border / shadow)
├── GSAP + ScrollTrigger → scroll animations (reveal, parallax shadow, optional pin)
├── Lenis                → smooth scroll
└── i18n layer           → bilingual VI/EN, localStorage-persisted
```

- **Static export** (`output: "export"`) → no server, fast Vercel deploy.
- **Data-driven content**: all features live in TypeScript data files, not hard-coded
  in JSX. Adding/editing a feature = editing data only. This is the key
  maintainability decision (Claude Code docs change over time).
- **Bilingual**: every content field is `{ vi: string, en: string }`. Header toggle
  flips the whole site; choice saved in `localStorage`.

## 4. Content Model

### Categories
Full ecosystem grouped into:

| Category | Example content |
|----------|-----------------|
| Slash Commands | `/help`, `/clear`, `/compact`, `/init`, `/model`, `/agents`, `/memory`, `/review`, `/btw` |
| Skills | SKILL.md system + bundled skills (`/batch`, `/code-review`) |
| Workflows | dynamic workflows, `/deep-research` |
| Subagents & Agent teams | the four multi-agent tiers |
| Hooks | event hooks |
| MCP | Model Context Protocol servers |
| Configuration | `CLAUDE.md`, settings, CLI flags, system prompt customization |

### Feature card schema
```ts
interface Feature {
  id: string;            // slug, used in /feature/[id]
  category: string;      // category id
  name: string;          // "/compact"
  tagline: I18n;         // one-line, easy to understand
  whatItDoes: I18n;      // explanation
  whenToUse: I18n;       // when to reach for it
  usage: string;         // syntax / copy-paste example
  example?: string;      // demo snippet
  sourceUrl: string;     // link to official docs
  verified: boolean;     // confirmed by deep-research vs. fetched from docs
}
interface I18n { vi: string; en: string; }
```

- `verified: true` → shows a "✓ Verified" badge (confirmed by the deep-research run).
- `verified: false` → still carries `sourceUrl` so readers can self-check.

## 5. Pages & Routes

```
/               → Hero (GSAP) + category overview + feature-card grid
/feature/[id]   → Deep-dive: what / when / usage / example (copyable) / source link
(header)        → logo + VI/EN toggle + category nav
```

- **Landing**: hero animation, then category sections; each category expands into a
  grid of feature cards showing the tagline. Skim to grasp the whole picture.
- **Deep-dive**: clicking a card routes to `/feature/[id]` with the full detail —
  this is where the "understand & use" happens.

## 6. Content Sourcing

- Core content from the verified deep-research report (three command types, Skills,
  four multi-agent tiers, system prompt config).
- **Supplement by fetching** official docs (`docs.anthropic.com/.../claude-code/*`)
  for missing basic commands (`/help`, `/clear`, `/compact`, `/init`, `/model`,
  `/memory`, `/review`...), hooks, MCP, CLI flags.
- The **4 claims refuted** by the research run are **excluded** to avoid publishing
  incorrect information:
  - Fixed bundled-skills list (`/debug`, `/loop`, `/claude-api` unconfirmed)
  - `.claude/commands/` ≡ `.claude/skills/` equivalence
  - `disableBundledSkills` setting
  - The exact "four tracking commands" framing
- Every card links to its source doc via `sourceUrl`.

## 7. Animation (GSAP)

- **Hero**: large block title snaps in; hard shadow "slams" down on a timeline.
- **ScrollTrigger**: feature cards slide in staggered/offset; shadows shift on scroll
  for depth.
- **Optional**: pin + horizontal scroll for the category strip (only if smooth).
- Lenis smooth scroll as the base.
- Respect `prefers-reduced-motion`: disable/curtail animation for motion-sensitive users.

## 8. Deploy

- `next.config` sets `output: "export"` → builds to `out/`.
- Initialize git repo + commit (directory is currently not a git repo).
- Deploy via Vercel CLI: user runs `! vercel login` (interactive) when prompted,
  then `vercel --prod`.

## 9. Out of Scope (YAGNI)

- No backend / server-side logic.
- No server-side search (client-side simple filter only if needed).
- No CMS.
- No authentication.
- No dark/light toggle (neo-brutalism uses one consistent light theme).

## 10. Open Items (resolve during implementation)

- Exact list of basic slash commands and their descriptions — to be pulled from
  live docs during the content-build step, each tagged with `sourceUrl`.
- Whether horizontal-pin category scroll stays in or is cut for smoothness.
