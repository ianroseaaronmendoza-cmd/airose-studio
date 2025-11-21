// src/api/music/reorder.ts
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

router.post("/api/music/reorder", express.json(), async (req, res) => {
  // Expect payload like: { albumId, newOrder: [songId1, songId2, ...] }
  const { albumId, newOrder } = req.body || {};
  if (!albumId || !Array.isArray(newOrder)) {
    return res.status(400).json({ error: "albumId and newOrder required" });
  }

  try {
    const raw = await fs.readFile(UPLOADS_FILE, "utf-8");
    const json = JSON.parse(raw);

    const album = (json.albums || []).find((a: any) => a.id === albumId);
    if (!album) return res.status(404).json({ error: "Album not found" });

    const songMap = (album.songs || []).reduce((acc: any, s: any) => {
      acc[s.id] = s;
      return acc;
    }, {});

    album.songs = newOrder.map((id: string) => songMap[id]).filter(Boolean);

    await atomicWrite(UPLOADS_FILE, JSON.stringify(json, null, 2));
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("[music/reorder] error:", err);
    return res.status(500).json({ error: "Failed to reorder" });
  }
});

export default router;
