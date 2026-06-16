# Claude Code Full Built-in Catalog — Design Spec

**Date:** 2026-06-16
**Status:** Approved (sections 1–3)
**Author:** Kiro (brainstorming session with daddy)
**Supersedes scope of:** 2026-06-15-claude-code-features-site-design.md (expands dataset from 21 → ~95 items)

## 1. Purpose & Goals

The existing showcase covers only 21 items, which is too few. Expand it to catalog
**all built-in features** of Claude Code CLI (v2.1.174): every built-in slash command,
every bundled skill, the bundled workflow, plus CLI flags and subcommands. **Exclude**
all user-created custom skills, commands, and agents.

**Success criteria:**
- Dataset grows to ~95 items (was 21), sourced from official docs + the local CLI.
- Each item is categorized by `kind` (command/skill/workflow/flag/subcommand) and by
  functional `category`.
- ~15-20 core items carry a Feynman-style deep-dive explanation.
- Visitors can search and filter the large list quickly.
- Bilingual VI/EN, neo-brutalist, GSAP-animated — all preserved from the existing site.
- Rebuilt and redeployed to the same Vercel project.

## 2. Decisions (locked)

| Decision | Choice |
|----------|--------|
| Scope | All built-in features; exclude user custom skills/commands/agents |
| Data source | CLI on machine first (backbone), Feynman deepresearch to enrich core items |
| Feynman role | Deep-dive for ~15-20 core items only (full ~95 would be too costly/slow) |
| Source of truth | Official docs `/commands` + `claude --help` (v2.1.174) |
| Stack | Unchanged: Next.js 15 static export + Tailwind + GSAP + Lenis, bilingual VI/EN |
| Art direction | Unchanged: neo-brutalism |

## 3. Architecture

Unchanged foundation. Two schema additions and three new UI components.

### Schema additions to `Feature` (lib/types.ts)
```ts
export type FeatureKind = "command" | "skill" | "workflow" | "flag" | "subcommand";

export interface Feature {
  id: string;
  category: string;
  kind: FeatureKind;        // NEW — drives the colored kind badge
  name: string;
  tagline: I18n;
  whatItDoes: I18n;
  whenToUse: I18n;
  usage: string;
  example?: string;
  deepDive?: I18n;          // NEW — Feynman-style deep explanation (core items only)
  sourceUrl: string;
  verified: boolean;
}
```
`validateFeature` extends to require a valid `kind` from the union.

## 4. Content Model

### Kind badges (Trục A — by kind)
- 🟧 `command` · 🟩 `skill` · 🟦 `workflow` · 🟪 `flag` · 🩷 `subcommand`

### Categories (Trục B — by function, mirrors the docs workflow stages)
Category ids and labels:

| id | VI label | EN label | Examples |
|----|----------|----------|----------|
| `setup` | Setup & khởi tạo | Setup & Init | /init, /memory, /config, /login, /permissions, /terminal-setup |
| `during-task` | Trong lúc làm việc | During a Task | /plan, /model, /effort, /context, /compact, /btw, /goal |
| `parallel` | Chạy song song | Parallel Work | /agents, /tasks, /background, /fork, /workflows |
| `review-ship` | Review & ship | Review & Ship | /diff, /review, /security-review |
| `between-sessions` | Giữa các phiên | Between Sessions | /clear, /resume, /branch, /rewind, /teleport, /export |
| `diagnostics` | Chẩn đoán & khắc phục | Diagnostics | /doctor, /feedback, /status, /insights, /release-notes |
| `skills` | Bundled Skills | Bundled Skills | /batch, /code-review, /debug, /loop, /simplify, /verify, /run, /run-skill-generator, /claude-api, /fewer-permission-prompts |
| `workflows` | Bundled Workflows | Bundled Workflows | /deep-research |
| `cli` | CLI flags & subcommands | CLI Flags & Subcommands | --bare, --safe-mode, --system-prompt, agents, mcp, doctor, plugin, ultrareview |

Note: a bundled skill like `/batch` has `kind: "skill"` AND `category: "skills"`. The
`kind` drives the badge; the `category` drives which section it appears under. Skills
and workflows get their own category section for prominence; commands are spread across
the functional categories.

### Item count target
At least 80 items (target ~95). Spread roughly: setup ~10, during-task ~12,
parallel ~8, review-ship ~6, between-sessions ~10, diagnostics ~8, skills 10,
workflows 1, cli ~15.

## 5. Pages & Routes (unchanged shape, new widgets)

```
/               → Hero + search bar + kind filter chips + category sections
/feature/[id]   → Deep-dive: what / when / usage / example + deepDive block if present
(header)        → logo + VI/EN toggle
```

New on landing:
- **Search box** — client-side instant filter over name + tagline (both languages).
- **Kind filter chips** — toggle command/skill/workflow/flag/subcommand.
- Cards with a `deepDive` show a **"🔬 Deep dive"** badge.

## 6. Content Sourcing & Build Process

1. **Backbone**: write all ~95 items into `lib/features.ts` from the official docs
   `/commands` page + `claude --help` (v2.1.174 on this machine). Each item:
   `name`, `kind`, `category`, bilingual `tagline`/`whatItDoes`/`whenToUse`, `usage`,
   `sourceUrl`.
2. **Feynman enrichment**: run `feynman` (via a subagent, using
   `C:\Users\AvadaGroup\AppData\Local\Programs\feynman\bin\feynman.ps1`) to author the
   `deepDive` field for ~15-20 core items: Skills system, Dynamic Workflows, Subagents,
   Agent teams, /compact, /context, /plan, /code-review, /batch, /rewind,
   /effort (ultracode), MCP, Hooks, /deep-research, /goal, /background.
3. Remaining items: bilingual descriptions written directly from docs.

### Accuracy rules
- Only list commands that work in **v2.1.174**. Exclude removed commands
  (`/pr-comments` removed v2.1.91, `/vim` removed v2.1.92).
- Exclude the 4 deep-research-refuted claims from the prior spec.
- Every item carries `sourceUrl` to official docs.
- `verified: true` only for items confirmed present in the local CLI (`claude --help`)
  or the official commands page.

## 7. Verification

- Upgrade `lib/features.test.ts`: every item has a valid `kind`, `category` in the set,
  full bilingual fields, https `sourceUrl`; `FEATURES.length >= 80`; unique ids.
- `npm test` green, `npm run build` produces `out/` with one page per feature.
- Redeploy to the existing Vercel project; smoke-test homepage + a few deep-dive routes
  + search/filter.

## 8. Out of Scope (YAGNI)

- No backend, no server-side search.
- No pagination (client-side search/filter suffices).
- No art-direction change.
- No user custom skills/commands/agents.
- No removed/deprecated commands.

## 9. Open Items (resolve during implementation)

- Final exact membership of each functional category (assign during data authoring;
  the docs workflow grouping is the guide).
- Which 15-20 items get Feynman deep-dives (list in §6 is the starting set; adjust if a
  core concept is missing).
