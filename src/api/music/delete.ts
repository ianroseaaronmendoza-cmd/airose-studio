// src/api/music/delete.ts
import { Router, Request, Response } from "express";

const router = Router();

/**
 * DELETE /api/music/delete
 * Deletes the configured music.json file from GitHub.
 * Body (optional): { confirm: true } (not required but handy)
 */
router.delete("/api/music/delete", async (req: Request, res: Response) => {
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

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(path)}`;

    // fetch to get sha
    const getRes = await fetch(`${apiBase}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });

    if (!getRes.ok) {
      if (getRes.status === 404) return res.json({ message: "File not found, nothing to delete." });
      const txt = await getRes.text();
      console.error("GitHub GET failed:", getRes.status, txt);
      return res.status(502).json({ error: `GitHub GET failed: ${getRes.status}` });
    }

    const getJson: any = await getRes.json();
    const sha = getJson.sha;
    if (!sha) return res.status(500).json({ error: "Could not determine file SHA" });

    // delete
    const delRes = await fetch(apiBase, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Delete music.json (${new Date().toISOString()})`,
        sha,
        branch,
      }),
    });

    const delText = await delRes.text();
    if (!delRes.ok) {
      console.error("GitHub DELETE failed:", delRes.status, delText);
      return res.status(502).json({ error: `GitHub DELETE failed: ${delRes.status}`, details: delText });
    }

    return res.json({ success: true, message: "music.json deleted from repo" });
  } catch (err: any) {
    console.error("Delete route error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

export default router;
