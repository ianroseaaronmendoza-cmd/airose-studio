import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";

const router = express.Router();

// PUT /api/novels/:slug
router.put("/novels/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { title, summary, note, coverUrl } = req.body;

    const existing = await prisma.novel.findUnique({ where: { slug } });
    if (!existing) return res.status(404).json({ error: "Novel not found" });

    // If new cover URL differs and existing.coverUrl is stored as file path, remove old file
    if (coverUrl && coverUrl !== existing.coverUrl && existing.coverUrl) {
      try {
        const oldPath = path.join(process.cwd(), existing.coverUrl.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        console.warn("⚠️ Could not remove old cover:", err);
      }
    }

    const updated = await prisma.novel.update({
      where: { slug },
      data: {
        title,
        summary,
        note,
        coverUrl: coverUrl ?? existing.coverUrl,
      },
    });

    res.json(updated);
  } catch (err: any) {
    console.error("❌ Error updating novel:", err);
    if (err.code === "P2025") return res.status(404).json({ error: "Novel not found" });
    res.status(500).json({ error: "Failed to update novel" });
  }
});

export default router;
