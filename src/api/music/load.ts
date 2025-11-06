// src/api/music/load.ts
import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/music/load
 * Fetches the latest music.json from GitHub (decodes base64) and returns it as JSON.
 * If file not found => returns { albums: [] }.
 */
router.get("/api/music/load", async (_req: Request, res: Response) => {
  try {
    const token =
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PAT ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = process.env.GITHUB_FILE_PATH_MUSIC || "data/music.json";

    if (!token || !owner || !repo) {
      return res.status(500).json({ error: "Missing GitHub configuration" });
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(path)}?ref=${branch}`;

    const r = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!r.ok) {
      if (r.status === 404) return res.json({ albums: [] });
      const txt = await r.text();
      console.error("GitHub GET failed:", r.status, txt);
      return res.status(502).json({ error: `GitHub GET failed: ${r.status}` });
    }

    const data: any = await r.json();
    if (!data || typeof data.content !== "string") {
      return res.status(500).json({ error: "Unexpected GitHub response" });
    }

    const decoded = Buffer.from(data.content, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);
    return res.json(parsed);
  } catch (err: any) {
    console.error("Load route error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

export default router;
