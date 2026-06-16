# Claude Code Features Showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a neo-brutalist, bilingual (VI/EN) showcase website that catalogs the Claude Code ecosystem with deep-dive pages, animated with GSAP, and deploy it to Vercel.

**Architecture:** Next.js 15 App Router with static export (`output: "export"`). Content is data-driven (TypeScript modules in `lib/`), rendered by focused components in `components/`. Language is a client-side React context persisted to `localStorage`. Scroll animation uses GSAP + ScrollTrigger over a Lenis smooth-scroll base, all gated behind `prefers-reduced-motion`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, GSAP + ScrollTrigger, Lenis, Vitest + Testing Library, Vercel CLI.

---

## File Structure

```
package.json              deps + scripts
next.config.mjs           output: "export", images.unoptimized
tsconfig.json             TS config (paths: @/*)
tailwind.config.ts        neo-brutalist design tokens
postcss.config.mjs        tailwind/autoprefixer
vitest.config.ts          test runner
vitest.setup.ts           jsdom + matchers
.gitignore

lib/
  types.ts                Feature, I18n, Category interfaces + validateFeature()
  features.ts             CATEGORIES + FEATURES data
  i18n.tsx                LanguageProvider, useLang(), localStorage persistence
  useReducedMotion.ts     prefers-reduced-motion hook
  types.test.ts           validateFeature tests
  features.test.ts        data-integrity tests
  i18n.test.tsx           context + persistence tests

components/
  SmoothScroll.tsx        Lenis wrapper (client)
  AnimateOnScroll.tsx     GSAP ScrollTrigger reveal wrapper (client)
  Header.tsx              logo + nav + LangToggle (client)
  LangToggle.tsx          VI/EN button (client)
  Hero.tsx                GSAP hero timeline (client)
  CopyBlock.tsx           copyable code block (client)
  FeatureCard.tsx         single card (client — reads lang)
  CategorySection.tsx     category heading + card grid (client)
  FeatureDetail.tsx       deep-dive content (client)

app/
  layout.tsx              root layout: fonts, providers, header
  globals.css             tailwind layers + neo-brutalist base
  page.tsx                landing: hero + category sections
  feature/[id]/page.tsx   deep-dive route + generateStaticParams
```

**Testing strategy:** The data/logic layer (`lib/`) is covered by Vitest unit tests (TDD). Visual/animation components are verified by a successful static build (`npm run build`) plus lint/type-check — you cannot meaningfully unit-test a GSAP timeline, so the build is the gate there.

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `next-env.d.ts` (auto-generated, but committed)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "claude-code-showcase",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "gsap": "3.12.7",
    "lenis": "1.1.18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.6.3",
    "@testing-library/react": "16.1.0",
    "@types/node": "22.10.7",
    "@types/react": "19.0.7",
    "@types/react-dom": "19.0.3",
    "@vitejs/plugin-react": "4.3.4",
    "autoprefixer": "10.4.20",
    "eslint": "9.18.0",
    "eslint-config-next": "15.1.6",
    "jsdom": "26.0.0",
    "postcss": "8.5.1",
    "tailwindcss": "3.4.17",
    "typescript": "5.7.3",
    "vitest": "2.1.8"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.next/
out/
.vercel/
*.log
.DS_Store
```

- [ ] **Step 3: Create `next.config.mjs`** (static export for Vercel + GitHub-Pages-safe)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};
export default nextConfig;
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, no peer-dependency errors that abort install.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore next.config.mjs tsconfig.json
git commit -m "chore: scaffold Next.js static-export project"
```

---

### Task 2: Tailwind + neo-brutalist design tokens

**Files:**
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/globals.css`

- [ ] **Step 1: Create `postcss.config.mjs`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 2: Create `tailwind.config.ts`** (neo-brutalist tokens: bold colors, hard shadow, thick border)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#F4F1E9",
        brand: "#D97706",   // Anthropic-ish orange
        lime: "#C7F464",
        sky: "#7CC4FF",
        pink: "#FF8FB1",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        brutal: "6px 6px 0 0 #0A0A0A",
        "brutal-lg": "10px 10px 0 0 #0A0A0A",
        "brutal-sm": "3px 3px 0 0 #0A0A0A",
      },
      borderWidth: { 3: "3px" },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }

body {
  @apply bg-paper text-ink font-sans antialiased;
}

@layer components {
  .brutal-box {
    @apply border-3 border-ink bg-white shadow-brutal;
  }
  .brutal-btn {
    @apply border-3 border-ink bg-brand px-4 py-2 font-bold shadow-brutal-sm
           transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5
           active:translate-x-0 active:translate-y-0;
  }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Commit**

```bash
git add postcss.config.mjs tailwind.config.ts app/globals.css
git commit -m "feat: add tailwind config and neo-brutalist design tokens"
```

---

### Task 3: Test runner setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Verify the runner boots (no tests yet)**

Run: `npm test`
Expected: Vitest runs and reports "No test files found" (exit 0 or the no-tests message). This confirms config loads.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts vitest.setup.ts
git commit -m "chore: add vitest config"
```

---

### Task 4: Core types + validateFeature (TDD)

**Files:**
- Create: `lib/types.ts`
- Test: `lib/types.test.ts`

- [ ] **Step 1: Write the failing test** — `lib/types.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { validateFeature, type Feature } from "./types";

const good: Feature = {
  id: "compact",
  category: "slash-commands",
  name: "/compact",
  tagline: { vi: "Nén hội thoại", en: "Compact the conversation" },
  whatItDoes: { vi: "Tóm tắt context", en: "Summarizes context" },
  whenToUse: { vi: "Khi context dài", en: "When context is long" },
  usage: "/compact",
  sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode",
  verified: false,
};

describe("validateFeature", () => {
  it("accepts a well-formed feature", () => {
    expect(validateFeature(good)).toEqual([]);
  });
  it("flags an empty id", () => {
    expect(validateFeature({ ...good, id: "" })).toContain("id is required");
  });
  it("flags a missing English tagline", () => {
    expect(
      validateFeature({ ...good, tagline: { vi: "x", en: "" } })
    ).toContain("tagline.en is required");
  });
  it("flags a non-http sourceUrl", () => {
    expect(validateFeature({ ...good, sourceUrl: "ftp://x" })).toContain(
      "sourceUrl must be http(s)"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/types.test.ts`
Expected: FAIL — `validateFeature` is not defined / module not found.

- [ ] **Step 3: Write minimal implementation** — `lib/types.ts`

```ts
export interface I18n {
  vi: string;
  en: string;
}

export interface Feature {
  id: string;
  category: string;
  name: string;
  tagline: I18n;
  whatItDoes: I18n;
  whenToUse: I18n;
  usage: string;
  example?: string;
  sourceUrl: string;
  verified: boolean;
}

export interface Category {
  id: string;
  label: I18n;
  blurb: I18n;
  accent: "brand" | "lime" | "sky" | "pink";
}

export function validateFeature(f: Feature): string[] {
  const errors: string[] = [];
  if (!f.id) errors.push("id is required");
  if (!f.name) errors.push("name is required");
  if (!f.category) errors.push("category is required");
  for (const key of ["tagline", "whatItDoes", "whenToUse"] as const) {
    if (!f[key]?.vi) errors.push(`${key}.vi is required`);
    if (!f[key]?.en) errors.push(`${key}.en is required`);
  }
  if (!/^https?:\/\//.test(f.sourceUrl)) errors.push("sourceUrl must be http(s)");
  return errors;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/types.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/types.test.ts
git commit -m "feat: add feature types and validateFeature"
```

---

### Task 5: Feature data + integrity tests (TDD)

**Files:**
- Create: `lib/features.ts`
- Test: `lib/features.test.ts`

This task seeds the dataset with the **verified** deep-research content plus the basic commands. During Step 3 you MAY run WebFetch on the `sourceUrl`s to refine descriptions, but the content below is sufficient and accurate to ship. Do NOT add the 4 refuted claims (fixed bundled-skills list, `.claude/commands/` ≡ `.claude/skills/`, `disableBundledSkills`, the "four tracking commands" framing).

- [ ] **Step 1: Write the failing test** — `lib/features.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { CATEGORIES, FEATURES } from "./features";
import { validateFeature } from "./types";

describe("features dataset", () => {
  it("has at least 6 categories", () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(6);
  });
  it("has unique feature ids", () => {
    const ids = FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every feature passes validateFeature", () => {
    for (const f of FEATURES) {
      expect(validateFeature(f), `feature ${f.id}`).toEqual([]);
    }
  });
  it("every feature category exists in CATEGORIES", () => {
    const catIds = new Set(CATEGORIES.map((c) => c.id));
    for (const f of FEATURES) {
      expect(catIds.has(f.category), `feature ${f.id} -> ${f.category}`).toBe(true);
    }
  });
  it("has at least 15 features", () => {
    expect(FEATURES.length).toBeGreaterThanOrEqual(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/features.test.ts`
Expected: FAIL — module `./features` not found.

- [ ] **Step 3: Write implementation** — `lib/features.ts`

Create the file with the categories block below, then the features array. Use these exact category ids: `slash-commands`, `skills`, `workflows`, `agents`, `hooks`, `mcp`, `config`.

```ts
import type { Category, Feature } from "./types";

export const CATEGORIES: Category[] = [
  { id: "slash-commands", accent: "brand",
    label: { vi: "Lệnh Slash", en: "Slash Commands" },
    blurb: { vi: "Lệnh gõ bằng / trong phiên tương tác.",
             en: "Commands you type with / in an interactive session." } },
  { id: "skills", accent: "lime",
    label: { vi: "Skills", en: "Skills" },
    blurb: { vi: "Prompt đóng gói, Claude tự gọi khi phù hợp.",
             en: "Packaged prompts Claude can auto-invoke when relevant." } },
  { id: "workflows", accent: "sky",
    label: { vi: "Workflows", en: "Workflows" },
    blurb: { vi: "Script điều phối nhiều subagent, chạy nền.",
             en: "Scripts orchestrating many subagents, run in background." } },
  { id: "agents", accent: "pink",
    label: { vi: "Subagents & Teams", en: "Subagents & Teams" },
    blurb: { vi: "Bốn cấp song song hoá công việc.",
             en: "Four tiers of parallelizing work." } },
  { id: "hooks", accent: "brand",
    label: { vi: "Hooks", en: "Hooks" },
    blurb: { vi: "Chạy lệnh theo sự kiện vòng đời.",
             en: "Run commands on lifecycle events." } },
  { id: "mcp", accent: "lime",
    label: { vi: "MCP", en: "MCP" },
    blurb: { vi: "Kết nối server công cụ bên ngoài.",
             en: "Connect external tool servers." } },
  { id: "config", accent: "sky",
    label: { vi: "Cấu hình", en: "Configuration" },
    blurb: { vi: "CLAUDE.md, settings, cờ CLI, system prompt.",
             en: "CLAUDE.md, settings, CLI flags, system prompt." } },
];
```

Then append the `FEATURES` array. Include AT LEAST these 18 features (copy verbatim; `D` = docs.anthropic.com base `https://docs.anthropic.com/en/docs/claude-code`):

```ts
export const FEATURES: Feature[] = [
  // ---- Slash Commands ----
  { id: "help", category: "slash-commands", name: "/help", verified: false,
    tagline: { vi: "Xem trợ giúp và danh sách lệnh", en: "Show help and command list" },
    whatItDoes: { vi: "Hiển thị các lệnh khả dụng và hướng dẫn nhanh.",
                  en: "Displays available commands and quick guidance." },
    whenToUse: { vi: "Khi quên cú pháp hoặc muốn xem mình gõ được gì.",
                 en: "When you forget syntax or want to see what you can type." },
    usage: "/help",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode" },

  { id: "clear", category: "slash-commands", name: "/clear", verified: false,
    tagline: { vi: "Xoá toàn bộ ngữ cảnh hội thoại", en: "Clear the conversation context" },
    whatItDoes: { vi: "Bắt đầu lại với ngữ cảnh trống, bỏ lịch sử hiện tại.",
                  en: "Starts fresh with empty context, dropping current history." },
    whenToUse: { vi: "Khi chuyển sang việc mới không liên quan.",
                 en: "When switching to an unrelated new task." },
    usage: "/clear",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode" },

  { id: "compact", category: "slash-commands", name: "/compact", verified: false,
    tagline: { vi: "Nén hội thoại để tiết kiệm context", en: "Compact the conversation to save context" },
    whatItDoes: { vi: "Tóm tắt lịch sử thành dạng ngắn, giữ ý chính.",
                  en: "Summarizes history into a shorter form, keeping the gist." },
    whenToUse: { vi: "Khi context gần đầy nhưng vẫn cần tiếp tục mạch việc.",
                 en: "When context is nearly full but you must keep going." },
    usage: "/compact",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode" },

  { id: "init", category: "slash-commands", name: "/init", verified: false,
    tagline: { vi: "Tạo file CLAUDE.md cho dự án", en: "Generate a CLAUDE.md for the project" },
    whatItDoes: { vi: "Quét codebase và sinh file hướng dẫn dự án.",
                  en: "Scans the codebase and generates a project guide file." },
    whenToUse: { vi: "Lần đầu dùng Claude Code trong một repo.",
                 en: "First time using Claude Code in a repo." },
    usage: "/init",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/memory" },

  { id: "model", category: "slash-commands", name: "/model", verified: false,
    tagline: { vi: "Đổi model đang dùng", en: "Switch the active model" },
    whatItDoes: { vi: "Chọn model (vd Opus/Sonnet/Haiku) cho phiên.",
                  en: "Selects the model (e.g. Opus/Sonnet/Haiku) for the session." },
    whenToUse: { vi: "Khi cần cân bằng tốc độ và độ thông minh.",
                 en: "When balancing speed against capability." },
    usage: "/model",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode" },

  { id: "memory", category: "slash-commands", name: "/memory", verified: false,
    tagline: { vi: "Sửa file bộ nhớ CLAUDE.md", en: "Edit the CLAUDE.md memory files" },
    whatItDoes: { vi: "Mở các file bộ nhớ để xem và chỉnh sửa.",
                  en: "Opens the memory files to view and edit." },
    whenToUse: { vi: "Khi muốn thêm/sửa hướng dẫn lâu dài.",
                 en: "When adding or editing persistent instructions." },
    usage: "/memory",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/memory" },

  { id: "btw", category: "slash-commands", name: "/btw", verified: true,
    tagline: { vi: "Hỏi nhanh câu phụ, không vào lịch sử", en: "Quick side question, never enters history" },
    whatItDoes: { vi: "Trả lời chỉ từ context sẵn có; không có quyền dùng tool; không ghi vào lịch sử.",
                  en: "Answers only from existing context; no tool access; never written to history." },
    whenToUse: { vi: "Khi cần hỏi nhanh mà không làm bẩn mạch hội thoại chính.",
                 en: "When you need a quick aside without polluting the main thread." },
    usage: "/btw <câu hỏi>",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/interactive-mode" },

  // ---- Skills ----
  { id: "skills-system", category: "skills", name: "Skills (SKILL.md)", verified: true,
    tagline: { vi: "Lệnh tự định nghĩa bằng SKILL.md", en: "Self-defined commands via SKILL.md" },
    whatItDoes: { vi: "Mỗi skill là thư mục chứa SKILL.md (YAML frontmatter + markdown); tên thư mục thành lệnh.",
                  en: "Each skill is a folder with SKILL.md (YAML frontmatter + markdown); the folder name becomes the command." },
    whenToUse: { vi: "Khi muốn đóng gói prompt lặp lại thành lệnh tái dùng.",
                 en: "When packaging a repeated prompt into a reusable command." },
    usage: ".claude/skills/<name>/SKILL.md  (project)\n~/.claude/skills/<name>/SKILL.md  (user)",
    example: "---\ndescription: ...\nallowed-tools: ...\n---\n# instructions",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/skills" },

  { id: "batch", category: "skills", name: "/batch", verified: true,
    tagline: { vi: "Thay đổi codebase quy mô lớn song song", en: "Large-scale parallel codebase changes" },
    whatItDoes: { vi: "Phân rã thành 5–30 đơn vị; mỗi đơn vị một subagent nền trong git worktree riêng, chạy test và mở PR.",
                  en: "Decomposes into 5–30 units; one background subagent per unit in an isolated git worktree, runs tests and opens a PR." },
    whenToUse: { vi: "Khi cần sửa lặp trên nhiều file/đơn vị độc lập.",
                 en: "For repetitive edits across many independent files/units." },
    usage: "/batch <mô tả thay đổi>",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/commands" },

  { id: "code-review", category: "skills", name: "/code-review", verified: true,
    tagline: { vi: "Review code nhiều mức effort", en: "Code review with effort levels" },
    whatItDoes: { vi: "Review với mức low|medium|high|xhigh|max|ultra; có --fix, --comment; 'ultra' chạy deep cloud review.",
                  en: "Reviews at low|medium|high|xhigh|max|ultra; supports --fix, --comment; 'ultra' runs a deep cloud review." },
    whenToUse: { vi: "Trước khi merge, hoặc khi cần soát kỹ thay đổi.",
                 en: "Before merging, or for a thorough change audit." },
    usage: "/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment]",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/commands" },

  // ---- Workflows ----
  { id: "workflows-system", category: "workflows", name: "Dynamic Workflows", verified: true,
    tagline: { vi: "Script JS điều phối subagent ở quy mô lớn", en: "JS scripts orchestrating subagents at scale" },
    whatItDoes: { vi: "Runtime chạy script ở nền; tối đa 1.000 agent/run, 16 agent đồng thời; kết quả trung gian giữ trong biến script.",
                  en: "A runtime executes the script in the background; up to 1,000 agents/run, 16 concurrent; intermediate results held in script variables." },
    whenToUse: { vi: "Khi việc fan-out lớn, cần vòng lặp/nhánh ngoài context.",
                 en: "For large fan-out work needing loops/branching outside context." },
    usage: "(bundled) /deep-research",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/workflows" },

  { id: "deep-research", category: "workflows", name: "/deep-research", verified: true,
    tagline: { vi: "Nghiên cứu web đa nguồn, kiểm chứng, báo cáo có trích dẫn", en: "Multi-source web research, verified, cited report" },
    whatItDoes: { vi: "Fan-out tìm kiếm web, fetch nguồn, kiểm chứng đối kháng theo phiếu, tổng hợp báo cáo. Workflow bundled duy nhất.",
                  en: "Fans out web searches, fetches sources, adversarially vote-verifies claims, synthesizes a report. The sole bundled workflow." },
    whenToUse: { vi: "Khi cần báo cáo nghiên cứu sâu, kiểm chứng kỹ.",
                 en: "When you need a deep, fact-checked research report." },
    usage: "/deep-research <câu hỏi>",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/workflows" },

  // ---- Subagents & Teams ----
  { id: "subagents", category: "agents", name: "Subagents", verified: true,
    tagline: { vi: "Instance Claude tự chủ, báo cáo về phiên chính", en: "Autonomous Claude instances reporting to the main session" },
    whatItDoes: { vi: "Chạy inline, làm việc được giao rồi trả kết quả; định nghĩa bằng Markdown + YAML ở .claude/agents/.",
                  en: "Run inline, do assigned work and report back; defined as Markdown + YAML in .claude/agents/." },
    whenToUse: { vi: "Khi cần giao việc song song giữ phiên chính gọn context.",
                 en: "To offload parallel work while keeping the main context lean." },
    usage: ".claude/agents/<name>.md  (project)\n~/.claude/agents/<name>.md  (user)",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/sub-agents" },

  { id: "agent-view", category: "agents", name: "Agent view", verified: true,
    tagline: { vi: "Màn hình điều phối phiên nền (research preview)", en: "Screen to dispatch/monitor background sessions (research preview)" },
    whatItDoes: { vi: "Một màn hình để khởi chạy và giám sát các phiên chạy nền; mở bằng 'claude agents'.",
                  en: "One screen to dispatch and monitor background sessions; opened with 'claude agents'." },
    whenToUse: { vi: "Khi theo dõi nhiều phiên nền cùng lúc.",
                 en: "When monitoring several background sessions at once." },
    usage: "claude agents   (thêm --json để in danh sách phiên dạng JSON)",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/agents" },

  { id: "agent-teams", category: "agents", name: "Agent teams", verified: true,
    tagline: { vi: "Phiên phối hợp qua task list + hộp thư (thử nghiệm)", en: "Coordinated sessions via shared task list + mailbox (experimental)" },
    whatItDoes: { vi: "Các teammate nhắn trực tiếp cho nhau; mặc định TẮT, cần bật env var.",
                  en: "Teammates message each other directly; disabled by default, needs an env var." },
    whenToUse: { vi: "Khi cần nhiều agent phối hợp chặt chẽ trên một task list chung.",
                 en: "When multiple agents must coordinate tightly over a shared task list." },
    usage: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1   (cần v2.1.32+)",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/agent-teams" },

  // ---- Hooks ----
  { id: "hooks", category: "hooks", name: "Hooks", verified: false,
    tagline: { vi: "Chạy lệnh shell theo sự kiện vòng đời", en: "Run shell commands on lifecycle events" },
    whatItDoes: { vi: "Cấu hình lệnh chạy tại các sự kiện như trước/sau khi gọi tool.",
                  en: "Configure commands to run at events such as before/after a tool call." },
    whenToUse: { vi: "Khi cần tự động format, lint, hoặc chặn hành động.",
                 en: "To auto-format, lint, or gate actions." },
    usage: "settings.json -> \"hooks\": { ... }",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/hooks" },

  // ---- MCP ----
  { id: "mcp", category: "mcp", name: "MCP servers", verified: false,
    tagline: { vi: "Kết nối công cụ/dữ liệu bên ngoài qua MCP", en: "Connect external tools/data via MCP" },
    whatItDoes: { vi: "Đăng ký server Model Context Protocol để Claude dùng thêm tool.",
                  en: "Register Model Context Protocol servers so Claude gains extra tools." },
    whenToUse: { vi: "Khi cần Claude truy cập DB, API, hệ thống ngoài.",
                 en: "When Claude needs access to a DB, API, or external system." },
    usage: "claude mcp add <name> ...",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/mcp" },

  // ---- Configuration ----
  { id: "claude-md", category: "config", name: "CLAUDE.md", verified: true,
    tagline: { vi: "File hướng dẫn dự án/người dùng", en: "Project/user instruction file" },
    whatItDoes: { vi: "Chèn hướng dẫn tuỳ biến ở phạm vi project hoặc user.",
                  en: "Injects custom instructions at project or user scope." },
    whenToUse: { vi: "Khi muốn Claude nhớ quy ước lâu dài của dự án.",
                 en: "To make Claude remember long-lived project conventions." },
    usage: "./CLAUDE.md  (project)   ~/.claude/CLAUDE.md  (user)",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/memory" },

  { id: "system-prompt-flags", category: "config", name: "--system-prompt flags", verified: true,
    tagline: { vi: "Tuỳ biến system prompt qua cờ CLI", en: "Customize the system prompt via CLI flags" },
    whatItDoes: { vi: "System prompt nội bộ không công bố; dùng --system-prompt(-file) để thay, --append-system-prompt(-file) để nối thêm.",
                  en: "Internal system prompt is unpublished; use --system-prompt(-file) to replace, --append-system-prompt(-file) to append." },
    whenToUse: { vi: "Khi cần đổi hẳn hoặc bổ sung hành vi mặc định.",
                 en: "To fully replace or augment default behavior." },
    usage: "claude --append-system-prompt \"...\"",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/cli-reference" },

  { id: "bare", category: "config", name: "--bare", verified: true,
    tagline: { vi: "Chế độ tối giản, bỏ auto-discovery", en: "Minimal mode, skips auto-discovery" },
    whatItDoes: { vi: "Bỏ qua hooks, skills, plugins, MCP, auto-memory, CLAUDE.md; chỉ còn Bash + đọc/sửa file.",
                  en: "Skips hooks, skills, plugins, MCP, auto-memory, CLAUDE.md; leaves only Bash + file read/edit." },
    whenToUse: { vi: "Khi cần phiên sạch, tối thiểu, dễ tái lập.",
                 en: "For a clean, minimal, reproducible session." },
    usage: "claude --bare",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/cli-reference" },

  { id: "disable-slash-commands", category: "config", name: "--disable-slash-commands", verified: true,
    tagline: { vi: "Tắt mọi skill và lệnh trong phiên", en: "Disable all skills and commands for the session" },
    whatItDoes: { vi: "Vô hiệu hoá toàn bộ skill/command cho phiên hiện tại.",
                  en: "Disables all skills/commands for the current session." },
    whenToUse: { vi: "Khi muốn môi trường tối giản, tránh tự gọi skill.",
                 en: "For a minimal environment that avoids auto-invoked skills." },
    usage: "claude --disable-slash-commands",
    sourceUrl: "https://docs.anthropic.com/en/docs/claude-code/cli-reference" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/features.test.ts`
Expected: PASS (5 tests). 7 categories, 21 features.

- [ ] **Step 5: Commit**

```bash
git add lib/features.ts lib/features.test.ts
git commit -m "feat: add Claude Code feature dataset with integrity tests"
```

---

### Task 6: Language context (i18n) (TDD)

**Files:**
- Create: `lib/i18n.tsx`
- Test: `lib/i18n.test.tsx`

- [ ] **Step 1: Write the failing test** — `lib/i18n.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLang } from "./i18n";

function Probe() {
  const { lang, setLang, t } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="val">{t({ vi: "Xin chào", en: "Hello" })}</span>
      <button onClick={() => setLang(lang === "vi" ? "en" : "vi")}>toggle</button>
    </div>
  );
}

describe("i18n", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to vi and translates", () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("vi");
    expect(screen.getByTestId("val").textContent).toBe("Xin chào");
  });

  it("toggles language and persists to localStorage", () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    act(() => { screen.getByText("toggle").click(); });
    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(screen.getByTestId("val").textContent).toBe("Hello");
    expect(localStorage.getItem("lang")).toBe("en");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/i18n.test.tsx`
Expected: FAIL — module `./i18n` not found.

- [ ] **Step 3: Write implementation** — `lib/i18n.tsx`

```tsx
"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { I18n } from "./types";

export type Lang = "vi" | "en";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (v: I18n) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "vi" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (v: I18n) => v[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/i18n.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.tsx lib/i18n.test.tsx
git commit -m "feat: add bilingual language context with localStorage persistence"
```

---

### Task 7: Reduced-motion hook

**Files:**
- Create: `lib/useReducedMotion.ts`

No test (thin wrapper over `matchMedia`, which jsdom does not implement meaningfully). Verified by build + manual check.

- [ ] **Step 1: Write implementation** — `lib/useReducedMotion.ts`

```ts
"use client";
import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/useReducedMotion.ts
git commit -m "feat: add prefers-reduced-motion hook"
```

---

### Task 8: SmoothScroll (Lenis) + AnimateOnScroll (GSAP)

**Files:**
- Create: `components/SmoothScroll.tsx`
- Create: `components/AnimateOnScroll.tsx`

- [ ] **Step 1: Write `components/SmoothScroll.tsx`**

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [reduced]);
  return <>{children}</>;
}
```

- [ ] **Step 2: Write `components/AnimateOnScroll.tsx`**

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export default function AnimateOnScroll({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const anim = gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      }
    );
    return () => { anim.scrollTrigger?.kill(); anim.kill(); };
  }, [reduced, delay]);

  return <div ref={ref}>{children}</div>;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/SmoothScroll.tsx components/AnimateOnScroll.tsx
git commit -m "feat: add Lenis smooth scroll and GSAP scroll-reveal wrappers"
```

---

### Task 9: LangToggle + Header

**Files:**
- Create: `components/LangToggle.tsx`
- Create: `components/Header.tsx`

- [ ] **Step 1: Write `components/LangToggle.tsx`**

```tsx
"use client";
import { useLang } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex border-3 border-ink shadow-brutal-sm">
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-3 py-1 font-bold uppercase ${
            lang === l ? "bg-ink text-paper" : "bg-white text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/Header.tsx`**

```tsx
"use client";
import Link from "next/link";
import LangToggle from "./LangToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b-3 border-ink bg-paper px-4 py-3 md:px-8">
      <Link href="/" className="text-xl font-black tracking-tight">
        CLAUDE<span className="text-brand">·</span>CODE
      </Link>
      <LangToggle />
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/LangToggle.tsx components/Header.tsx
git commit -m "feat: add header with bilingual toggle"
```

---

### Task 10: CopyBlock

**Files:**
- Create: `components/CopyBlock.tsx`

- [ ] **Step 1: Write `components/CopyBlock.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/CopyBlock.tsx
git commit -m "feat: add copyable code block"
```

---

### Task 11: FeatureCard + CategorySection

**Files:**
- Create: `components/FeatureCard.tsx`
- Create: `components/CategorySection.tsx`

- [ ] **Step 1: Write `components/FeatureCard.tsx`**

```tsx
"use client";
import Link from "next/link";
import type { Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useLang();
  return (
    <Link
      href={`/feature/${feature.id}`}
      className="group block border-3 border-ink bg-white p-4 shadow-brutal transition-transform hover:-translate-x-1 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-bold">{feature.name}</span>
        {feature.verified && (
          <span className="shrink-0 border-2 border-ink bg-lime px-1 text-xs font-bold">
            ✓ verified
          </span>
        )}
      </div>
      <p className="mt-2 text-sm">{t(feature.tagline)}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Write `components/CategorySection.tsx`**

```tsx
"use client";
import type { Category, Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import FeatureCard from "./FeatureCard";
import AnimateOnScroll from "./AnimateOnScroll";

export default function CategorySection({
  category,
  features,
}: {
  category: Category;
  features: Feature[];
}) {
  const { t } = useLang();
  const accent = {
    brand: "bg-brand", lime: "bg-lime", sky: "bg-sky", pink: "bg-pink",
  }[category.accent];

  return (
    <section id={category.id} className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <AnimateOnScroll>
        <div className={`inline-block border-3 border-ink ${accent} px-3 py-1 shadow-brutal-sm`}>
          <h2 className="text-2xl font-black uppercase">{t(category.label)}</h2>
        </div>
        <p className="mt-3 max-w-2xl text-lg">{t(category.blurb)}</p>
      </AnimateOnScroll>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <AnimateOnScroll key={f.id} delay={i * 0.05}>
            <FeatureCard feature={f} />
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/FeatureCard.tsx components/CategorySection.tsx
git commit -m "feat: add feature card and category section"
```

---

### Task 12: FeatureDetail + Hero

**Files:**
- Create: `components/FeatureDetail.tsx`
- Create: `components/Hero.tsx`

- [ ] **Step 1: Write `components/FeatureDetail.tsx`**

```tsx
"use client";
import Link from "next/link";
import type { Feature } from "@/lib/types";
import { useLang } from "@/lib/i18n";
import CopyBlock from "./CopyBlock";

export default function FeatureDetail({ feature }: { feature: Feature }) {
  const { t, lang } = useLang();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <Link href="/" className="brutal-btn inline-block text-sm">
        ← {lang === "vi" ? "Tất cả tính năng" : "All features"}
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <h1 className="font-mono text-3xl font-black md:text-4xl">{feature.name}</h1>
        {feature.verified && (
          <span className="border-2 border-ink bg-lime px-2 py-1 text-xs font-bold">✓ verified</span>
        )}
      </div>
      <p className="mt-2 text-xl">{t(feature.tagline)}</p>

      <Section title={lang === "vi" ? "Là gì" : "What it does"}>{t(feature.whatItDoes)}</Section>
      <Section title={lang === "vi" ? "Khi nào dùng" : "When to use"}>{t(feature.whenToUse)}</Section>

      <h3 className="mt-8 text-lg font-black uppercase">{lang === "vi" ? "Cách dùng" : "Usage"}</h3>
      <div className="mt-2"><CopyBlock code={feature.usage} /></div>

      {feature.example && (
        <>
          <h3 className="mt-6 text-lg font-black uppercase">{lang === "vi" ? "Ví dụ" : "Example"}</h3>
          <div className="mt-2"><CopyBlock code={feature.example} /></div>
        </>
      )}

      <a
        href={feature.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block underline decoration-brand decoration-2 underline-offset-4"
      >
        {lang === "vi" ? "Nguồn tài liệu chính thức ↗" : "Official documentation source ↗"}
      </a>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-black uppercase">{title}</h3>
      <p className="mt-2 leading-relaxed">{children}</p>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/Hero.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Hero() {
  const { lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        y: 60, opacity: 0, rotate: -2, duration: 0.7,
        ease: "power4.out", stagger: 0.12,
      });
      gsap.from(".hero-shadow", {
        x: -10, y: -10, opacity: 0, duration: 0.5, delay: 0.4, ease: "power2.out",
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, lang]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <h1 className="text-5xl font-black leading-[0.95] md:text-7xl">
        <span className="hero-line block">CLAUDE CODE</span>
        <span className="hero-line hero-shadow mt-2 inline-block border-3 border-ink bg-brand px-3 shadow-brutal-lg">
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

- [ ] **Step 3: Commit**

```bash
git add components/FeatureDetail.tsx components/Hero.tsx
git commit -m "feat: add feature detail view and animated hero"
```

---

### Task 13: App shell — layout, landing page, deep-dive route

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/feature/[id]/page.tsx`

- [ ] **Step 1: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";

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
          <SmoothScroll>
            <Header />
            {children}
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write `app/page.tsx`**

```tsx
import { CATEGORIES, FEATURES } from "@/lib/features";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";

export default function Home() {
  return (
    <main>
      <Hero />
      {CATEGORIES.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          features={FEATURES.filter((f) => f.category === cat.id)}
        />
      ))}
      <footer className="border-t-3 border-ink px-4 py-8 text-center text-sm md:px-8">
        Built with Next.js + GSAP · Data sourced from docs.anthropic.com
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Write `app/feature/[id]/page.tsx`** (static params for export)

```tsx
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import FeatureDetail from "@/components/FeatureDetail";

export function generateStaticParams() {
  return FEATURES.map((f) => ({ id: f.id }));
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const feature = FEATURES.find((f) => f.id === id);
  if (!feature) notFound();
  return <FeatureDetail feature={feature} />;
}
```

- [ ] **Step 4: Run the dev server to smoke-test**

Run: `npm run dev` then open `http://localhost:3000`
Expected: Landing renders hero + category sections; clicking a card opens `/feature/<id>`; VI/EN toggle flips text. Stop the server (Ctrl+C) when done.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx "app/feature/[id]/page.tsx"
git commit -m "feat: add app layout, landing page, and deep-dive route"
```

---

### Task 14: Full verification (build + tests + lint)

**Files:** none (verification only)

- [ ] **Step 1: Run the unit tests**

Run: `npm test`
Expected: PASS — all suites (types, features, i18n) green.

- [ ] **Step 2: Run the static build**

Run: `npm run build`
Expected: Build succeeds; an `out/` directory is produced with `index.html` and `feature/<id>/index.html` for every feature. Fix any type/build errors before continuing.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors. (If `next lint` prompts for config on first run, accept the strict default.)

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: pass build, tests, and lint"
```

---

### Task 15: Deploy to Vercel

**Files:** none (deployment)

> **Security note:** This is an outward-facing publish. The site is fully static, public, and contains no secrets or auth — confirm with the user before the production deploy.

- [ ] **Step 1: Ensure Vercel CLI is available**

Run: `npx vercel --version`
Expected: prints a version. (Uses `npx`; no global install needed.)

- [ ] **Step 2: Log in (interactive — user runs this)**

Ask the user to run, in the Claude Code prompt:
`! npx vercel login`
Expected: browser/email auth completes; CLI reports "Congratulations!".

- [ ] **Step 3: Deploy to production**

Run: `npx vercel --prod --yes`
Expected: CLI links/creates the project, uploads, and prints a production URL
(`https://<project>.vercel.app`). Because `next.config.mjs` sets `output: "export"`,
Vercel serves the static `out/` build.

- [ ] **Step 4: Verify the live site**

Open the printed URL.
Expected: Hero + categories render, deep-dive routes work, VI/EN toggle works.

- [ ] **Step 5: Commit Vercel project metadata**

```bash
git add -A
git commit -m "chore: add Vercel project config"
```

(`.vercel/` is gitignored except `project.json` if Vercel writes one outside it; commit whatever non-secret metadata appears. Do NOT commit any token files.)

---

## Self-Review

**Spec coverage:**
- §1 purpose / §2 decisions → Tasks 1–2 (stack, tokens), all tasks honor VI/EN + neo-brutalism. ✓
- §3 architecture (static export, data-driven, i18n) → Task 1 (`output: export`), Task 5 (data), Task 6 (i18n). ✓
- §4 content model (categories, Feature schema, verified badge) → Task 4 (types), Task 5 (data), Task 11 (badge). ✓
- §5 pages/routes (`/`, `/feature/[id]`, header) → Task 13, Task 9. ✓
- §6 content sourcing + exclude 4 refuted claims → Task 5 (explicit exclusion note). ✓
- §7 animation (hero, scroll reveal, reduced-motion) → Task 8, Task 12, Task 7. ✓
- §8 deploy (static export, git init, vercel) → Task 1, Task 15. Git already initialized in brainstorming. ✓
- §9 out of scope → respected (no backend/CMS/auth/dark toggle). ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. ✓

**Type consistency:** `Feature`/`I18n`/`Category` defined in Task 4 and used identically in Tasks 5, 11, 12, 13. `useLang().t/lang/setLang` defined in Task 6, used consistently. `accent` union (`brand|lime|sky|pink`) in Task 4 matches the map in Task 11. Category ids in Task 5 (`slash-commands`...`config`) are the only ones referenced. ✓

**Note:** Tailwind `border-3` utility is defined via `borderWidth: { 3: "3px" }` in Task 2 and used throughout — consistent. ✓

