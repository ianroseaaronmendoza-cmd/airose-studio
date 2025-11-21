// src/api/music/delete.ts
import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();
const UPLOADS_FILE = path.join(process.cwd(), "uploads", "music.json");
const TEMP_FILE = path.join(process.cwd(), "uploads", "music.json.tmp");

async function atomicWrite(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(TEMP_FILE, content, "utf-8");
  await fs.rename(TEMP_FILE, filePath);
}

router.post("/api/music/delete", express.json(), async (req, res) => {
  const { albumId, songId } = req.body || {};
  if (!albumId) return res.status(400).json({ error: "albumId required" });

  try {
    // Read existing
    const raw = await fs.readFile(UPLOADS_FILE, "utf-8");
    const json = JSON.parse(raw);

    // Delete logic
    if (songId) {
      // delete single song from album
      const album = (json.albums || []).find((a: any) => a.id === albumId);
      if (!album) return res.status(404).json({ error: "Album not found" });
      album.songs = (album.songs || []).filter((s: any) => s.id !== songId);
    } else {
      // delete album
      json.albums = (json.albums || []).filter((a: any) => a.id !== albumId);
    }

    await atomicWrite(UPLOADS_FILE, JSON.stringify(json, null, 2));
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[music/delete] error:", err);
    return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
