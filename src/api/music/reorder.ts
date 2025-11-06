// src/api/music/reorder.ts
import { Router, Request, Response } from "express";

const router = Router();

/**
 * POST /api/music/reorder
 * Body: { albums: Array }
 *
 * Commits only the reordered albums JSON to GitHub.
 * This is identical to /api/music/save but with a different commit message.
 */
router.post("/api/music/reorder", async (req: Request, res: Response) => {
  try {
    const { albums } = req.body;
    if (!albums || !Array.isArray(albums)) {
      return res.status(400).json({ error: "Missing or invalid 'albums' array" });
    }

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

    // get current sha
    let sha: string | undefined;
    try {
      const g = await fetch(`${apiBase}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });
      if (g.ok) {
        const gj: any = await g.json();
        sha = gj.sha;
      } else if (g.status === 404) {
        return res.status(404).json({ error: "music.json not found on repo" });
      } else {
        const txt = await g.text();
        console.warn("GitHub GET failed:", g.status, txt);
        return res.status(502).json({ error: `GitHub GET failed: ${g.status}` });
      }
    } catch (err: any) {
      console.error("GitHub GET error:", err);
      return res.status(502).json({ error: "Failed to reach GitHub" });
    }

    // prepare & commit
    const contentStr = JSON.stringify({ albums }, null, 2);
    const contentB64 = Buffer.from(contentStr, "utf8").toString("base64");

    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Reorder music (${new Date().toISOString()})`,
        content: contentB64,
        sha,
        branch,
      }),
    });

    const putText = await putRes.text();
    if (!putRes.ok) {
      console.error("GitHub PUT failed:", putRes.status, putText);
      return res.status(502).json({ error: `GitHub PUT failed: ${putRes.status}`, details: putText });
    }

    const putJson: any = JSON.parse(putText);
    return res.json({ success: true, commit: putJson.commit, html_url: putJson.commit?.html_url });
  } catch (err: any) {
    console.error("Reorder route error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

export default router;
