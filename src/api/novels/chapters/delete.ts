import express from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// DELETE /api/novels/:novelSlug/chapters/:chapterSlug
router.delete("/novels/:novelSlug/chapters/:chapterSlug", async (req, res) => {
  try {
    const { novelSlug, chapterSlug } = req.params;
    const novel = await prisma.novel.findUnique({ where: { slug: novelSlug } });
    if (!novel) return res.status(404).json({ error: "Novel not found" });

    const existing = await prisma.chapter.findUnique({
      where: { novelId_slug: { novelId: novel.id, slug: chapterSlug } },
    });
    if (!existing) return res.status(404).json({ error: "Chapter not found" });

    await prisma.chapter.delete({ where: { id: existing.id } });

    // reindex positions
    const remaining = await prisma.chapter.findMany({
      where: { novelId: novel.id },
      orderBy: { position: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      const ch = remaining[i];
      if (ch.position !== i + 1) {
        await prisma.chapter.update({ where: { id: ch.id }, data: { position: i + 1 } });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting chapter:", err);
    res.status(500).json({ error: "Failed to delete chapter" });
  }
});

export default router;
