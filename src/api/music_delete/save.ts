// src/api/music/save.ts
import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

const UPLOADS_FILE = path.join(process.cwd(), "uploads", "music.json");
const TEMP_FILE = path.join(process.cwd(), "uploads", "music.json.tmp");

// Helper to ensure folder exists
async function ensureUploadsDir() {
  await fs.mkdir(path.dirname(UPLOADS_FILE), { recursive: true });
}

async function atomicWrite(filePath: string, content: string) {
  await ensureUploadsDir();
  await fs.writeFile(TEMP_FILE, content, "utf-8");
  await fs.rename(TEMP_FILE, filePath);
}

router.post("/api/music/save", express.json(), async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) {
      return res.status(400).json({ error: "Missing body" });
    }

    // Save locally to persistent volume (always)
    try {
      const content = JSON.stringify(payload, null, 2);
      await atomicWrite(UPLOADS_FILE, content);
    } catch (writeErr) {
      console.error("[music/save] write error:", writeErr);
      return res.status(500).json({ error: "Failed to save music data" });
    }

    // Skip GitHub sync in production (Option A)
    if (process.env.NODE_ENV === "production") {
      // Respond success (no GH sync)
      return res.json({ ok: true, message: "Saved to volume (GH sync disabled in production)" });
    }

    // For non-production: attempt to sync to GitHub if configured (legacy)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. user/repo
    const GITHUB_PATH = process.env.GITHUB_PATH || "data/music.json";

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      // If not configured, return success (but note that we did not sync)
      return res.json({ ok: true, message: "Saved locally (no GitHub config)" });
    }

    // If configured, do a minimal GitHub upload (optional)
    try {
      // Minimal: create commit via GitHub REST API (contents endpoint).
      // Keep this very small and optional — avoid failing save because GH sync fails.
      const contentBase64 = Buffer.from(JSON.stringify(payload, null, 2)).toString("base64");
      const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

      // Try fetching existing file to get sha
      const fetchRes = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}`, "User-Agent": "airose-studio" },
      });

      let sha;
      if (fetchRes.ok) {
        const existing = await fetchRes.json();
        sha = existing.sha;
      }

      const commitBody: any = {
        message: "Update music.json (from editor)",
        content: contentBase64,
      };
      if (sha) commitBody.sha = sha;

      await fetch(url, {
        method: "PUT",
        headers: { Authorization: `token ${GITHUB_TOKEN}`, "User-Agent": "airose-studio", "Content-Type": "application/json" },
        body: JSON.stringify(commitBody),
      });

      return res.json({ ok: true, message: "Saved locally and synced to GitHub" });
    } catch (ghErr) {
      console.warn("[music/save] GitHub sync failed:", ghErr);
      return res.json({ ok: true, message: "Saved locally (GitHub sync failed)" });
    }
  } catch (err: any) {
    console.error("[music/save] unexpected:", err);
    return res.status(500).json({ error: "Failed to save music data" });
  }
});

export default router;
