# Airose Studio maintenance boundaries

- Work on a feature branch. Do not push or commit directly to main. Do not use scripts/deploy.js or scripts/publish.ts for PR work; they target main.
- Devotion is an externally used church service. Preserve /devotion, /devotion/morning, and /devotion/evening, including direct refreshes and the existing Google Apps Script requests.
- Devotion must not inherit portfolio redesigns automatically. Its dedicated shell is src/components/devotion/. Never replace it with portfolio components or deduplicate it into the portfolio layout.
- Unless the user explicitly requests a Devotion change, do not change its page files, reader, hook, dedicated header/footer/layout, or inherited visual behavior. The retained Moment link in its frozen header is intentional: preserving Devotion takes precedence over unrelated link cleanup; Moment itself returns the normal not-found page.
- Keep new design styles scoped under .portfolio. Changes to src/index.css, Tailwind theme/base rules, shared providers, or global routing/build configuration require Devotion regression checks. Do not add document-wide portfolio styles.
- Content is in public/data; public/uploads contains deployed assets. Do not delete existing writing, novel chapters, music, uploads, or Support functionality as cleanup.
- Repository hygiene and unused dependency cleanup are deferred. Do not remove dist, archive files, legacy hooks, or framework remnants in the redesign PR.
- Run pnpm test, pnpm exec tsc --noEmit, and pnpm run build. Review all three Devotion URLs and the Vercel preview before merging.

See docs/portfolio-redesign.md for content structure and verification details.
