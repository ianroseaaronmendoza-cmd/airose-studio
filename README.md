# Airose Studio

A static React 18 / TypeScript portfolio, built with Webpack and Tailwind and deployed to Vercel. React Router handles direct links through the existing SPA rewrite.

## Local development

- Install: `pnpm install --frozen-lockfile`
- Start the local editor/site: `pnpm dev`
- Test: `pnpm test`
- Type check: `pnpm exec tsc --noEmit`
- Production build: `pnpm run build` (output: `dist`)

Content lives in `public/data`; deployed images live in `public/uploads`. Local Webpack middleware saves editor changes to JSON. Vercel serves a static build with editing disabled.

## Portfolio

Home · Books & Stories · Projects · Music · Writing · About. Support is secondary. Books use a simple static JSON catalog. Free novels can be read on this site through the existing chapter URLs; Wattpad is secondary. Capacity to Give links to its Amazon paperback listing.

See [portfolio architecture and review checklist](docs/portfolio-redesign.md) and [maintenance boundaries](AGENTS.md).

## Devotion compatibility

`/devotion`, `/devotion/morning`, and `/devotion/evening` support Aletheia Bible Church's external Facebook workflow. Their dedicated layout must not inherit portfolio changes. Do not alter their pages, reader, data hook, or global visual dependencies without explicit authorization.

## Publishing changes

Create a feature branch, run checks, open a PR, and inspect the Vercel preview before merging. **Do not run `pnpm deploy` or `scripts/publish.ts` for this workflow:** those legacy scripts target `main`. Repository hygiene and unused dependency cleanup are separate work.
