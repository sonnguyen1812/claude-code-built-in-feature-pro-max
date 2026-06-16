# Claude Code — Every Built-in Feature

A bilingual (Vietnamese / English), neo-brutalist showcase of the **entire Claude Code CLI built-in catalog**: every built-in slash command, bundled skill, bundled workflow, CLI flag, and subcommand — 116 items in total.

🔗 **Live site:** https://claude-code-built-in-feature-pro-max.vercel.app

## What's inside

- **116 built-in features** sourced from the official docs (`docs.anthropic.com/.../commands`) and the local CLI (`claude --help`, v2.1.174), organized into 9 functional categories.
- **Kind badges** — command · skill · workflow · flag · subcommand.
- **Feynman-style deep-dives** for 16 core features, authored with the Feynman research CLI: a plain-language explanation plus an everyday analogy, in both Vietnamese and English.
- **Instant search + kind filters** for browsing the full catalog client-side.
- **Bilingual toggle** (VI / EN) persisted to `localStorage`.

Excludes user-created custom skills, commands, and agents, and any commands removed in recent versions.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, static export)
- [Tailwind CSS](https://tailwindcss.com/) — neo-brutalist design tokens
- [GSAP](https://gsap.com/) + ScrollTrigger — scroll animation
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll
- [Vitest](https://vitest.dev/) — unit tests for the data layer
- Deployed on [Vercel](https://vercel.com/)

## Development

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm test         # run unit tests
npm run build    # produce the static export in out/
```

## Project structure

```
lib/
  types.ts        Feature / Category types + validation
  features.ts     the 116-item dataset (9 categories)
  deepdives.ts    Feynman-authored deep-dives for 16 core items
  i18n.tsx        bilingual language context
components/       Hero, FeatureCard, CatalogView, SearchFilter, FeatureDetail, ...
app/              layout, landing page, /feature/[id] deep-dive route
docs/superpowers/ design specs and implementation plans
```

## License

Content describing Claude Code features is sourced from Anthropic's official documentation. This showcase is an independent project.
