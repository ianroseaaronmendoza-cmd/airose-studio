# Editor Mode (Local Only)

- Editor Mode is always ON during `pnpm dev`
- Editor Mode exposes UI for creating, editing, deleting, and reordering content
- Editor Mode never runs in production builds (Vercel)
- All edits write JSON files to /data/** using Webpack dev-server
- Saving triggers endpoints such as:

  - /dev/sections/save
  - /dev/blog/save
  - /dev/poem/save
  - /dev/project/save
  - /dev/music/save

- All content lives in /data/**
- Publishing to production uses scripts/publish.ts
