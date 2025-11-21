// src/api/music/load.ts
import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

const UPLOADS_FILE = path.join(process.cwd(), "uploads", "music.json");
const DIST_FILE = path.join(process.cwd(), "dist", "data", "music.json");

async function ensureUploadsFile(): Promise<void> {
  try {
    // If uploads file exists, do nothing
    await fs.access(UPLOADS_FILE);
    return;
  } catch {
    // Not exists — try to copy from dist fallback
    try {
      const distData = await fs.readFile(DIST_FILE, "utf-8");
      await fs.mkdir(path.dirname(UPLOADS_FILE), { recursive: true });
      await fs.writeFile(UPLOADS_FILE, distData, "utf-8");
      return;
    } catch {
      // No dist fallback — create minimal structure
      await fs.mkdir(path.dirname(UPLOADS_FILE), { recursive: true });
      await fs.writeFile(UPLOADS_FILE, JSON.stringify({ albums: [] }, null, 2), "utf-8");
      return;
    }
  }
}

router.get("/api/music/load", async (_req, res) => {
  try {
    await ensureUploadsFile();
    const data = await fs.readFile(UPLOADS_FILE, "utf-8");
    const json = JSON.parse(data);
    return res.json(json);
  } catch (err: any) {
    console.error("[music/load] failed to read music.json:", err);
    return res.status(500).json({ error: "Failed to load music data" });
  }
});

export default router;
