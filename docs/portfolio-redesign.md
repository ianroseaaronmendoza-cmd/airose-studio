# Creative studio portfolio

The primary navigation is Home, Books & Stories, Projects, Music, Writing, About. Support remains accessible in the footer. Existing writing and chapter URLs remain available. Moment routes fall through to the application's normal not-found page, with no redirects. On this static SPA that is a rendered 404 page, not a new server-side HTTP status policy.

## Devotion boundary

The original header and footer were copied byte-for-byte into src/components/devotion. DevotionLayout reproduces the original App shell and spacing. PortfolioLayout has its own navigation, footer, and styles, scoped under .portfolio. The three Devotion pages, reader, hook, Google endpoint, global CSS, theme, shared query/editor providers, and Vercel rewrites are retained.

Do not consolidate the two layouts in a future cleanup. They serve different audiences and have different compatibility requirements. A portfolio task is not authorization to update Devotion.

## Books

public/data/books.json is imported directly; no new API or service is involved. Records contain title, slug, type, availability (purchase or free), cover, description, externalUrl, author, and featured. readerUrl is the primary destination for free works, preserving existing on-site chapters. externalLinkIsProfile makes the button explicitly identify an author profile rather than implying a direct story link.

Capacity to Give links to the user-supplied Amazon paperback listing. Its typographic title treatment is a fallback, not a supplied cover image. The two Wattpad works are labeled free; their individual story URLs are still pending, so the existing author profile is used as a clearly labeled secondary link. Replace the secondary links when the author supplies the URLs. The existing website contains 13 chapters for Seriously? and a three-part prologue for In the Mind of the Genius; the UI reports the available chapter count without claiming the whole novel is present. The reader uses a comfortable text width, adjustable text size, a table of contents, and previous/next navigation. No prices or digital-edition claims are added.

## Projects

description is the canonical short description. Readers accept legacy summary values, and saving converts them to description. Existing creation dates and unedited record fields survive saves; updatedAt changes on save. The index contains card metadata, while the full record includes content, screenshots, links, and updates.

Statuses: Released, In Development, Prototype, Experiment, Archived. Status is optional for legacy records whose status has not been established. Category is independent. Screenshots have url/alt, links have label/url, and updates have date/title/body. The local editor provides controls for all these fields. Featured records appear on Home. Lazy Lounge can be added once its actual status and content are supplied; no details have been fabricated.

Airose Refiner Mini is featured with its existing screenshot and download link. Existing long-form content and timestamps are preserved. Project HTML is sanitized on rendering.

## Review workflow

Use a feature branch and PR preview. Never use the existing main-targeting deployment scripts. Run pnpm test, pnpm exec tsc --noEmit, and pnpm run build. The build writes tracked dist artifacts; keep those generated changes out of this PR, since Vercel rebuilds the source and dist hygiene is deferred.

Check desktop/mobile navigation, Books availability and destinations, project filters and empty states, project save/reload round trips, existing chapter links, Music, Writing, About, Support, and both Moment URL forms. On the Devotion baseline and preview, compare all three direct URLs, reading payloads, loading/error states, desktop/mobile shell, and navigation from the portfolio. Live readings depend on the unchanged Google Apps Script service.
