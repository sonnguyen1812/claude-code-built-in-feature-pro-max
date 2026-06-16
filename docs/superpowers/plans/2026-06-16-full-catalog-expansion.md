# Full Built-in Catalog Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Claude Code showcase from 21 to ~95 built-in items, add `kind`/`deepDive` to the data model, enrich ~16 core items with Feynman-authored deep-dives, and add search + kind-filter to the landing page.

**Architecture:** Extend the existing data-driven Next.js 15 static-export site. The `Feature` type gains `kind` (badge) and `deepDive` (optional Feynman explanation). `lib/features.ts` is rewritten with ~95 items across 9 categories. Landing page gains a client-side search box and kind-filter chips. Deep-dive pages render the `deepDive` block when present. Redeploy to the existing Vercel project.

**Tech Stack:** Next.js 15, TypeScript, Tailwind, GSAP, Lenis, Vitest, Feynman CLI (for deep-dive content), Vercel CLI.

---

## File Structure

```
lib/types.ts              MODIFY — add FeatureKind, kind, deepDive; extend validateFeature
lib/types.test.ts         MODIFY — cover kind validation
lib/features.ts           REWRITE — 9 categories + ~95 items with kind/category
lib/features.test.ts      MODIFY — kind valid, >=80 items, category membership
lib/deepdives.ts          CREATE — Feynman deepDive content keyed by feature id, merged into FEATURES
lib/features.ts           (merge deepDives at export time)
components/FeatureCard.tsx     MODIFY — kind badge + "deep dive" badge
components/CategorySection.tsx MODIFY — pass through (no logic change beyond ordering)
components/SearchFilter.tsx    CREATE — search box + kind chips (client, controls visible list)
components/CatalogView.tsx     CREATE — client wrapper holding search/filter state + sections
components/FeatureDetail.tsx   MODIFY — render deepDive block when present
app/page.tsx                   MODIFY — render Hero + CatalogView
```

**Why `CatalogView`:** search/filter is client state. `app/page.tsx` is a server component. Extract the interactive catalog (search box + chips + filtered sections) into one client component, keeping the page a thin server shell. `CategorySection` stays presentational.

**Why `lib/deepdives.ts` separate:** the ~16 Feynman deep-dives are long bilingual prose. Keeping them in their own file keeps `features.ts` readable, and lets the Feynman-enrichment task touch one file without risking the dataset.

**Testing strategy:** Data/logic (`lib/`) is covered by Vitest. UI is verified by `npm run build` + manual smoke test.

---

### Task 1: Extend the Feature type with `kind` and `deepDive` (TDD)

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/types.test.ts`

- [ ] **Step 1: Add failing tests** — append to `lib/types.test.ts` inside the existing `describe("validateFeature", ...)` block (add `kind: "command"` to the existing `good` object first so it stays valid):

First, update the `good` fixture at the top of the file to include the new required field. Change the object to add one line:
```ts
  kind: "command",
```
(place it right after the `name: "/compact",` line)

Then add these test cases inside the `describe` block:
```ts
  it("flags an invalid kind", () => {
    expect(validateFeature({ ...good, kind: "bogus" as never })).toContain(
      "kind must be one of command|skill|workflow|flag|subcommand"
    );
  });
  it("accepts an optional deepDive", () => {
    expect(
      validateFeature({ ...good, deepDive: { vi: "giải thích", en: "explain" } })
    ).toEqual([]);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/types.test.ts`
Expected: FAIL — `kind` not on type / validateFeature doesn't check kind.

- [ ] **Step 3: Update `lib/types.ts`**

Add the kind union above `Feature`:
```ts
export type FeatureKind = "command" | "skill" | "workflow" | "flag" | "subcommand";
```
Add two fields to the `Feature` interface — `kind` after `name`, `deepDive` after `example`:
```ts
  kind: FeatureKind;
```
```ts
  deepDive?: I18n;
```
Extend `validateFeature` — add this check before the `sourceUrl` check:
```ts
  const kinds = ["command", "skill", "workflow", "flag", "subcommand"];
  if (!kinds.includes(f.kind)) {
    errors.push("kind must be one of command|skill|workflow|flag|subcommand");
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/types.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/types.test.ts
git commit -m "feat: add kind and deepDive to Feature type"
```

---

### Task 2: Restructure categories to the 9 functional groups (TDD)

**Files:**
- Modify: `lib/features.ts` (CATEGORIES block only, in this task)
- Modify: `lib/features.test.ts`

- [ ] **Step 1: Update the category test** — replace the `"has at least 6 categories"` test in `lib/features.test.ts` with:

```ts
  it("has the 9 functional categories", () => {
    const ids = CATEGORIES.map((c) => c.id).sort();
    expect(ids).toEqual(
      [
        "between-sessions", "cli", "diagnostics", "during-task",
        "parallel", "review-ship", "setup", "skills", "workflows",
      ].sort()
    );
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/features.test.ts`
Expected: FAIL — current categories are the old 7 ids.

- [ ] **Step 3: Replace the `CATEGORIES` array** in `lib/features.ts` with:

```ts
export const CATEGORIES: Category[] = [
  { id: "setup", accent: "brand",
    label: { vi: "Setup & khởi tạo", en: "Setup & Init" },
    blurb: { vi: "Chuẩn bị dự án: bộ nhớ, cấu hình, đăng nhập, quyền.",
             en: "Get a project ready: memory, config, login, permissions." } },
  { id: "during-task", accent: "lime",
    label: { vi: "Trong lúc làm việc", en: "During a Task" },
    blurb: { vi: "Điều khiển reasoning, context và mạch làm việc.",
             en: "Control reasoning, context, and flow mid-task." } },
  { id: "parallel", accent: "sky",
    label: { vi: "Chạy song song", en: "Parallel Work" },
    blurb: { vi: "Giao việc cho subagent, chạy nền, batch.",
             en: "Delegate to subagents, run in background, batch." } },
  { id: "review-ship", accent: "pink",
    label: { vi: "Review & ship", en: "Review & Ship" },
    blurb: { vi: "Soát diff, review, kiểm tra bảo mật trước khi giao.",
             en: "Inspect the diff, review, security-check before shipping." } },
  { id: "between-sessions", accent: "brand",
    label: { vi: "Giữa các phiên", en: "Between Sessions" },
    blurb: { vi: "Dọn, tiếp tục, rẽ nhánh, tua lại hội thoại.",
             en: "Clear, resume, branch, rewind conversations." } },
  { id: "diagnostics", accent: "lime",
    label: { vi: "Chẩn đoán & khắc phục", en: "Diagnostics" },
    blurb: { vi: "Kiểm tra cài đặt, gỡ lỗi, báo lỗi, xem thống kê.",
             en: "Check install, debug, report bugs, view stats." } },
  { id: "skills", accent: "sky",
    label: { vi: "Bundled Skills", en: "Bundled Skills" },
    blurb: { vi: "Skill đóng gói sẵn, Claude tự gọi khi phù hợp.",
             en: "Pre-bundled skills Claude can auto-invoke when relevant." } },
  { id: "workflows", accent: "pink",
    label: { vi: "Bundled Workflows", en: "Bundled Workflows" },
    blurb: { vi: "Workflow đa-agent đóng gói, chạy nền.",
             en: "Pre-bundled multi-agent workflows that run in background." } },
  { id: "cli", accent: "brand",
    label: { vi: "CLI flags & subcommands", en: "CLI Flags & Subcommands" },
    blurb: { vi: "Cờ và lệnh con khi khởi chạy `claude` từ terminal.",
             en: "Flags and subcommands when launching `claude` from a terminal." } },
];
```

Note: the `FEATURES` array still references old category ids at this point — that's fixed in Task 3. Tests for FEATURES will fail until Task 3; that's expected. Run only the category test here:

- [ ] **Step 4: Run the category test to verify it passes**

Run: `npx vitest run lib/features.test.ts -t "9 functional categories"`
Expected: PASS for that test (other FEATURES tests may fail — fixed in Task 3).

- [ ] **Step 5: Commit**

```bash
git add lib/features.ts lib/features.test.ts
git commit -m "feat: restructure to 9 functional categories"
```

---

### Task 3: Rewrite the FEATURES dataset to ~95 items (TDD)

**Files:**
- Modify: `lib/features.ts` (FEATURES array)
- Modify: `lib/features.test.ts`

**Source of truth (read these before authoring):**
- Official docs: `https://docs.anthropic.com/en/docs/claude-code/commands` (descriptions for every `/command`). Fetch it with WebFetch.
- Local CLI: run `claude --help` for the flags/subcommands wording.

Author bilingual `tagline` (one line), `whatItDoes`, `whenToUse` for each item by
condensing the official docs description into clear VI + EN. Keep `usage` as the exact
invocation. Set `verified: true` for items present in `claude --help` or the docs
commands table; `false` only if you cannot confirm. `sourceUrl` is the docs commands
page for `/commands`, the cli-reference page for flags/subcommands:
`https://docs.anthropic.com/en/docs/claude-code/cli-reference`.

**Exclusion rules:** Do NOT include `/pr-comments` (removed v2.1.91) or `/vim`
(removed v2.1.92). Do NOT include any user custom skills/commands/agents.

#### Complete membership table (id · name · kind · category)

Use the `name` minus the leading `/` (or `--`) as the `id`, lowercased, dashes kept
(e.g. `/add-dir` → id `add-dir`; `--system-prompt` → id `flag-system-prompt`;
subcommand `mcp` → id `sub-mcp`). This guarantees unique ids across kinds.

**category `setup` (kind: command):** /add-dir, /cd, /chrome, /color, /config, /help, /hooks, /ide, /init, /install-github-app, /install-slack-app, /keybindings, /login, /logout, /mcp, /memory, /terminal-setup, /theme, /statusline, /sandbox

**category `during-task` (kind: command):** /advisor, /btw, /compact, /context, /effort, /fast, /focus, /goal, /model, /plan, /tui, /scroll-speed, /voice

**category `parallel` (kind: command):** /agents, /background, /fork, /tasks, /workflows, /schedule

**category `review-ship` (kind: command):** /autofix-pr, /diff, /review, /security-review, /ultraplan, /ultrareview

**category `between-sessions` (kind: command):** /branch, /clear, /copy, /desktop, /exit, /export, /mobile, /recap, /remote-control, /rename, /resume, /rewind, /teleport, /web-setup, /remote-env

**category `diagnostics` (kind: command):** /cost, /doctor, /feedback, /heapdump, /insights, /passes, /privacy-settings, /radio, /release-notes, /reload-plugins, /reload-skills, /stats, /status, /stickers, /usage, /usage-credits, /upgrade, /powerup, /team-onboarding, /plugin

**category `skills` (kind: skill):** /batch, /claude-api, /code-review, /debug, /fewer-permission-prompts, /loop, /run, /run-skill-generator, /simplify, /verify

**category `workflows` (kind: workflow):** /deep-research

**category `cli` (kind: flag):** --bare, --safe-mode, --system-prompt, --append-system-prompt, --add-dir, --model, --effort, --continue, --resume, --print, --permission-mode, --worktree, --mcp-config, --disable-slash-commands, --dangerously-skip-permissions

**category `cli` (kind: subcommand):** agents, auth, doctor, install, mcp, plugin, project, setup-token, ultrareview, update

That is 20+13+6+6+15+20+10+1+15+10 = **116 candidate items**. Author at least 80; the
full set is the target. If any item's behavior is unclear from the docs, you may omit it
and note which — but aim for the full list.

- [ ] **Step 1: Update the dataset tests** in `lib/features.test.ts`. Replace the `"has at least 15 features"` test and add kind checks:

```ts
  it("has at least 80 features", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(80);
  });
  it("every feature has a valid kind", () => {
    const kinds = ["command", "skill", "workflow", "flag", "subcommand"];
    for (const f of FEATURES) {
      expect(kinds.includes(f.kind), `feature ${f.id} kind ${f.kind}`).toBe(true);
    }
  });
  it("all bundled skills are in the skills category", () => {
    for (const f of FEATURES) {
      if (f.kind === "skill") expect(f.category).toBe("skills");
    }
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/features.test.ts`
Expected: FAIL — far fewer than 80 items, no `kind` field.

- [ ] **Step 3: Rewrite the `FEATURES` array.** Each entry follows this exact shape. Six worked examples (one per situation) to lock the style — author the rest the same way:

```ts
export const FEATURES: Feature[] = [
  // setup
  { id: "init", category: "setup", kind: "command", name: "/init", verified: true,
    tagline: { vi: "Tạo file CLAUDE.md cho dự án", en: "Generate a CLAUDE.md for the project" },
    whatItDoes: { vi: "Quét codebase và sinh file hướng dẫn dự án để Claude nhớ quy ước.",
                  en: "Scans the codebase and generates a project guide file Claude remembers." },
    whenToUse: { vi: "Lần đầu dùng Claude Code trong một repo.",
                 en: "First time using Claude Code in a repo." },
    usage: "/init",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/commands" },

  // during-task
  { id: "context", category: "during-task", kind: "command", name: "/context", verified: true,
    tagline: { vi: "Xem context đang dùng vào đâu", en: "Visualize where context is going" },
    whatItDoes: { vi: "Hiện lưới màu mô tả mức dùng context và gợi ý tối ưu.",
                  en: "Shows a colored grid of context usage with optimization hints." },
    whenToUse: { vi: "Khi hội thoại dài và muốn biết chỗ nào ngốn context.",
                 en: "When the conversation is long and you want to see what's consuming context." },
    usage: "/context [all]",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/commands" },

  // skills (kind skill)
  { id: "code-review", category: "skills", kind: "skill", name: "/code-review", verified: true,
    tagline: { vi: "Review diff nhiều mức effort", en: "Review the diff at several effort levels" },
    whatItDoes: { vi: "Soát diff tìm bug và điểm dọn dẹp; --fix để áp dụng; 'ultra' chạy cloud review.",
                  en: "Reviews the diff for bugs and cleanups; --fix applies them; 'ultra' runs a cloud review." },
    whenToUse: { vi: "Trước khi merge hoặc khi cần soát kỹ thay đổi.",
                 en: "Before merging or for a thorough change audit." },
    usage: "/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/commands" },

  // workflows (kind workflow)
  { id: "deep-research", category: "workflows", kind: "workflow", name: "/deep-research", verified: true,
    tagline: { vi: "Nghiên cứu web đa nguồn có trích dẫn", en: "Multi-source web research, cited" },
    whatItDoes: { vi: "Fan-out tìm web, fetch nguồn, chéo kiểm chứng, tổng hợp báo cáo có trích dẫn.",
                  en: "Fans out web searches, fetches sources, cross-checks, synthesizes a cited report." },
    whenToUse: { vi: "Khi cần báo cáo nghiên cứu sâu, kiểm chứng kỹ.",
                 en: "When you need a deep, fact-checked research report." },
    usage: "/deep-research <question>",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/workflows" },

  // cli (kind flag)
  { id: "flag-bare", category: "cli", kind: "flag", name: "--bare", verified: true,
    tagline: { vi: "Chế độ tối giản, bỏ auto-discovery", en: "Minimal mode, skips auto-discovery" },
    whatItDoes: { vi: "Bỏ hooks, LSP, plugin, auto-memory, CLAUDE.md; chỉ còn Bash + đọc/sửa file.",
                  en: "Skips hooks, LSP, plugins, auto-memory, CLAUDE.md; leaves Bash + file read/edit." },
    whenToUse: { vi: "Khi cần phiên sạch, tối thiểu, dễ tái lập.",
                 en: "For a clean, minimal, reproducible session." },
    usage: "claude --bare",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/cli-reference" },

  // cli (kind subcommand)
  { id: "sub-mcp", category: "cli", kind: "subcommand", name: "claude mcp", verified: true,
    tagline: { vi: "Quản lý MCP server từ terminal", en: "Manage MCP servers from the terminal" },
    whatItDoes: { vi: "Thêm, liệt kê, gỡ các Model Context Protocol server cho Claude Code.",
                  en: "Add, list, and remove Model Context Protocol servers for Claude Code." },
    whenToUse: { vi: "Khi cấu hình kết nối công cụ ngoài trước khi mở phiên.",
                 en: "When configuring external tool connections before a session." },
    usage: "claude mcp [add|list|remove] ...",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/cli-reference" },

  // ... author the remaining items from the membership table above, same shape ...
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/features.test.ts`
Expected: PASS — all dataset tests green, `FEATURES.length >= 80`, every category populated, all `kind: "skill"` items in `skills` category.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/features.ts lib/features.test.ts
git commit -m "feat: expand dataset to full built-in catalog (80+ items)"
```

---

### Task 4: Author Feynman deep-dives for ~16 core items

**Files:**
- Create: `lib/deepdives.ts`

The Feynman CLI is at `C:\Users\AvadaGroup\AppData\Local\Programs\feynman\bin\feynman.ps1`.
It is authenticated (model anthropic/claude-opus-4-8). Use one-shot mode:
`feynman --prompt "<prompt>"` (run via PowerShell with the bin dir on PATH).

The 16 core item ids to enrich (must match ids authored in Task 3):
`skills-system`* , `deep-research`, `subagents`* , `agent-teams`* , `compact`, `context`,
`plan`, `code-review`, `batch`, `rewind`, `effort`, `mcp`* , `hooks`, `goal`, `background`, `flag-bare`

*Items marked `*` (the conceptual systems: skills-system, subagents, agent-teams, mcp)
may not exist as commands in Task 3's table. For those, the deepDive attaches to the
nearest command id that does exist: `skills-system`→`reload-skills`, `subagents`→`agents`,
`agent-teams`→`agents` (skip duplicate; pick `background` instead), `mcp`→`mcp` (the
`/mcp` command). Net: enrich these existing ids — `reload-skills`, `agents`, `mcp`,
`deep-research`, `compact`, `context`, `plan`, `code-review`, `batch`, `rewind`,
`effort`, `hooks`, `goal`, `background`, `flag-bare`, `init`. That's 16 existing ids.

- [ ] **Step 1: Generate deep-dive content with Feynman.** For each of the 16 ids, run Feynman with this prompt template (substitute the feature name and what it does). Example for `/compact`:

```powershell
$env:Path += ";C:\Users\AvadaGroup\AppData\Local\Programs\feynman\bin"
feynman --prompt "Explain the Claude Code CLI feature '/compact' (summarizes the conversation to free up context) using the Feynman technique: plain language, a concrete everyday analogy, and why it matters. 2 short paragraphs, no jargon. Then give the same explanation in Vietnamese. Format exactly as: ===EN=== <english> ===VI=== <vietnamese>"
```

Collect each result. Keep each language to ~2 short paragraphs. If Feynman is slow or errors on an item, write the deep-dive yourself in the same Feynman style (plain language + analogy) — note which were hand-written.

- [ ] **Step 2: Write `lib/deepdives.ts`** mapping id → bilingual deepDive. Shape:

```ts
import type { I18n } from "./types";

export const DEEP_DIVES: Record<string, I18n> = {
  compact: {
    en: "Think of your conversation as a whiteboard that slowly fills up... (Feynman text)",
    vi: "Hãy coi cuộc hội thoại như một tấm bảng trắng dần đầy lên... (văn Feynman)",
  },
  // ... the other 15 ids ...
};
```

Paste the actual Feynman-generated text for each id (no placeholders in the real file).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add lib/deepdives.ts
git commit -m "feat: add Feynman-authored deep-dives for core items"
```

---

### Task 5: Merge deep-dives into FEATURES + integrity test (TDD)

**Files:**
- Modify: `lib/features.ts` (export merge)
- Modify: `lib/features.test.ts`

- [ ] **Step 1: Add a failing test** to `lib/features.test.ts`:

```ts
import { DEEP_DIVES } from "./deepdives";

  it("attaches every deepDive to an existing feature", () => {
    const ids = new Set(FEATURES.map((f) => f.id));
    for (const id of Object.keys(DEEP_DIVES)) {
      expect(ids.has(id), `deepDive id ${id} has no feature`).toBe(true);
    }
  });
  it("features with a deepDive expose it", () => {
    const withDive = FEATURES.filter((f) => f.deepDive);
    expect(withDive.length).toBeGreaterThanOrEqual(15);
  });
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/features.test.ts`
Expected: FAIL — `deepDive` not attached yet.

- [ ] **Step 3: Merge in `lib/features.ts`.** Change the raw array to a const and export a merged version. Rename the literal `export const FEATURES` to `const RAW_FEATURES`, then at the bottom add:

```ts
import { DEEP_DIVES } from "./deepdives";

export const FEATURES: Feature[] = RAW_FEATURES.map((f) =>
  DEEP_DIVES[f.id] ? { ...f, deepDive: DEEP_DIVES[f.id] } : f
);
```
(put the `import` at the top with the other import; the `.map` at the file end.)

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/features.test.ts`
Expected: PASS — all dataset tests green, >=15 features carry a deepDive.

- [ ] **Step 5: Commit**

```bash
git add lib/features.ts lib/features.test.ts
git commit -m "feat: merge deep-dives into feature dataset"
```

---

### Task 6: Kind badge + deep-dive badge on FeatureCard

**Files:**
- Modify: `components/FeatureCard.tsx`

No unit test (visual); verified by build. The card currently shows name + verified badge + tagline. Add a kind badge (colored by kind) and a "🔬 deep dive" badge when `feature.deepDive` exists.

- [ ] **Step 1: Replace `components/FeatureCard.tsx`** with:

```tsx
"use client";
import Link from "next/link";
import type { Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const KIND_STYLE: Record<FeatureKind, string> = {
  command: "bg-brand",
  skill: "bg-lime",
  workflow: "bg-sky",
  flag: "bg-pink",
  subcommand: "bg-white",
};

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  return (
    <Link
      href={`/feature/${feature.id}`}
      className="group block border-3 border-ink bg-white p-4 shadow-brutal transition-transform hover:-translate-x-1 hover:-translate-y-1"
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/FeatureCard.tsx
git commit -m "feat: add kind and deep-dive badges to feature card"
```

---

### Task 7: Render the deep-dive block in FeatureDetail

**Files:**
- Modify: `components/FeatureDetail.tsx`

Add a Feynman deep-dive section after the "When to use" section, before the Usage block, only when `feature.deepDive` exists.

- [ ] **Step 1: Read the current file** to find the line with the "When to use" `<Section>` and the Usage `<h3>`.

Run: open `components/FeatureDetail.tsx` and locate:
```tsx
      <Section title={lang === "vi" ? "Khi nào dùng" : "When to use"}>{t(feature.whenToUse)}</Section>

      <h3 className="mt-8 text-lg font-black uppercase">{lang === "vi" ? "Cách dùng" : "Usage"}</h3>
```

- [ ] **Step 2: Insert the deep-dive block** between those two lines:

```tsx
      {feature.deepDive && (
        <div className="mt-8 border-3 border-ink bg-pink/30 p-4 shadow-brutal-sm">
          <h3 className="text-lg font-black uppercase">
            🔬 {lang === "vi" ? "Đào sâu (kiểu Feynman)" : "Deep dive (Feynman)"}
          </h3>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{t(feature.deepDive)}</p>
        </div>
      )}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/FeatureDetail.tsx
git commit -m "feat: render Feynman deep-dive block on detail page"
```

---

### Task 8: SearchFilter + CatalogView (client-side search & kind chips)

**Files:**
- Create: `components/SearchFilter.tsx`
- Create: `components/CatalogView.tsx`

- [ ] **Step 1: Write `components/SearchFilter.tsx`** (presentational controls):

```tsx
"use client";
import type { FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";

const KINDS: FeatureKind[] = ["command", "skill", "workflow", "flag", "subcommand"];

export default function SearchFilter({
  query, setQuery, active, toggleKind,
}: {
  query: string;
  setQuery: (s: string) => void;
  active: Set<FeatureKind>;
  toggleKind: (k: FeatureKind) => void;
}) {
  const { lang } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={lang === "vi" ? "Tìm lệnh, skill, flag..." : "Search commands, skills, flags..."}
        className="w-full border-3 border-ink bg-white px-4 py-3 font-mono shadow-brutal focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => toggleKind(k)}
            aria-pressed={active.has(k)}
            className={`border-3 border-ink px-3 py-1 text-sm font-bold shadow-brutal-sm ${
              active.has(k) ? "bg-ink text-paper" : "bg-white text-ink"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/CatalogView.tsx`** (holds state, filters, renders sections):

```tsx
"use client";
import { useMemo, useState } from "react";
import type { Category, Feature, FeatureKind } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import SearchFilter from "./SearchFilter";
import CategorySection from "./CategorySection";

export default function CatalogView({
  categories, features,
}: {
  categories: Category[];
  features: Feature[];
}) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<FeatureKind>>(new Set());

  const toggleKind = (k: FeatureKind) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return features.filter((f) => {
      if (active.size > 0 && !active.has(f.kind)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.tagline.vi.toLowerCase().includes(q) ||
        f.tagline.en.toLowerCase().includes(q)
      );
    });
  }, [features, query, active]);

  const visibleCategories = categories.filter(
    (c) => filtered.some((f) => f.category === c.id)
  );

  return (
    <div>
      <SearchFilter query={query} setQuery={setQuery} active={active} toggleKind={toggleKind} />
      {visibleCategories.length === 0 ? (
        <p className="mx-auto max-w-6xl px-4 py-12 text-lg md:px-8">
          {lang === "vi" ? "Không tìm thấy mục nào." : "No matching items."}
        </p>
      ) : (
        visibleCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            features={filtered.filter((f) => f.category === cat.id)}
          />
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add components/SearchFilter.tsx components/CatalogView.tsx
git commit -m "feat: add client-side search and kind-filter catalog view"
```

---

### Task 9: Wire CatalogView into the landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`** with:

```tsx
import { CATEGORIES, FEATURES } from "@/lib/features";
import Hero from "@/components/Hero";
import CatalogView from "@/components/CatalogView";

export default function Home() {
  return (
    <main>
      <Hero />
      <CatalogView categories={CATEGORIES} features={FEATURES} />
      <footer className="border-t-3 border-ink px-4 py-8 text-center text-sm md:px-8">
        Built with Next.js + GSAP · Data sourced from docs.anthropic.com
      </footer>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire search/filter catalog into landing page"
```

---

### Task 10: Full verification + redeploy

**Files:** none (verification + deploy)

> **Security note:** outward-facing redeploy to the existing public Vercel project. Static, no secrets. Proceed (user already authorized deployment).

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: PASS — types + features suites green (incl. >=80 items, kind, deepDive).

- [ ] **Step 2: Static build**

Run: `npm run build`
Expected: success; `out/` regenerated with one page per feature (80+ feature pages) + `index.html`. Fix any type/build errors.

- [ ] **Step 3: Smoke-test locally**

Run: `npm run dev`, open `http://localhost:3000`. Confirm: search filters the list; kind chips filter; a deep-dive card shows the 🔬 badge and its detail page shows the Feynman block; VI/EN toggle still flips everything. Stop the server.

- [ ] **Step 4: Redeploy to existing Vercel project**

Run: `npx vercel --prod --yes`
Expected: prints the production URL; aliases to the existing `claude-code-built-in-feature-pro-ma.vercel.app`.

- [ ] **Step 5: Verify live**

Run: `curl -s -o /dev/null -w "%{http_code}" https://claude-code-built-in-feature-pro-ma.vercel.app/`
Expected: 200. Spot-check 2-3 deep-dive routes return 200.

- [ ] **Step 6: Commit any deploy metadata**

```bash
git add -A
git commit -m "chore: redeploy full catalog" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:**
- §2 schema (`kind`, `deepDive`) → Task 1. ✓
- §3 architecture (CatalogView client wrapper) → Task 8, Task 9. ✓
- §4 9 categories + kind badges → Task 2 (categories), Task 6 (badge). ✓
- §4 ~95 items, membership table → Task 3. ✓
- §5 search + kind chips + deep-dive badge → Task 8 (search/chips), Task 6 (badge). ✓
- §6 backbone from docs/CLI → Task 3; Feynman enrichment → Task 4; merge → Task 5. ✓
- §6 exclusion rules (removed commands, custom) → Task 3 exclusion note. ✓
- §7 verification (>=80, valid kind, build, redeploy) → Task 3 tests, Task 10. ✓
- §8 out of scope respected (no backend, no pagination, no art change). ✓

**Placeholder scan:** Task 3 and Task 4 intentionally instruct authoring content from a
cited source rather than inlining ~95×6 strings — the membership table (the WHAT) is
fully specified, the shape is shown with 6 worked examples, and the source URLs are
exact. This is a data-authoring task, not a placeholder. No "TODO/TBD" in code steps.

**Type consistency:** `FeatureKind` union defined in Task 1 is reused identically in
Tasks 3, 6, 8. `deepDive?: I18n` (Task 1) read in Tasks 5, 6, 7. `DEEP_DIVES:
Record<string, I18n>` (Task 4) consumed in Task 5. `CatalogView` props
(`categories`, `features`) match `app/page.tsx` call (Task 9). `KIND_STYLE` covers all
5 union members. ✓

