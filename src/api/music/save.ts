// src/api/music/save.ts
import { Router, Request, Response } from "express";

const router = Router();

/**
 * POST /api/music/save
 * Body: { albums: Array }
 *
 * Commits the provided albums array to the configured GitHub repo/file path.
 * Returns { success: true, commit, html_url } on success.
 */
router.post("/api/music/save", async (req: Request, res: Response) => {
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

    // 1) Try to get existing file SHA (if exists)
    let sha: string | undefined;
    try {
      const g = await fetch(`${apiBase}?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (g.ok) {
        const gj: any = await g.json();
        sha = gj.sha;
      } else if (g.status === 404) {
        // file not found - we'll create it
      } else {
        const txt = await g.text();
        console.warn("GitHub GET non-200:", g.status, txt);
        return res.status(502).json({ error: `GitHub GET failed: ${g.status}` });
      }
    } catch (err: any) {
      console.error("Failed to GET current file from GitHub:", err);
      return res.status(502).json({ error: "Failed to reach GitHub" });
    }

    // 2) Prepare content
    const payloadObj = { albums };
    const contentStr = JSON.stringify(payloadObj, null, 2);
    const contentBase64 = Buffer.from(contentStr, "utf8").toString("base64");

    // 3) PUT commit to GitHub
    try {
      const putRes = await fetch(apiBase, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update music.json (${new Date().toISOString()})`,
          content: contentBase64,
          sha: sha ?? undefined,
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
      console.error("GitHub PUT error:", err);
      return res.status(502).json({ error: "Failed to commit to GitHub" });
    }
  } catch (err: any) {
    console.error("Save route error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
});

export default router;
