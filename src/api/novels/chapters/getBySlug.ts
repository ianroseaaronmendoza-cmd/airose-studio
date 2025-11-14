import express from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// GET /api/novels/:novelSlug/chapters/:chapterSlug
router.get("/novels/:novelSlug/chapters/:chapterSlug", async (req, res) => {
  try {
    const { novelSlug, chapterSlug } = req.params;
    const novel = await prisma.novel.findUnique({
      where: { slug: novelSlug },
    });
    if (!novel) return res.status(404).json({ error: "Novel not found" });

    const chapter = await prisma.chapter.findUnique({
      where: { novelId_slug: { novelId: novel.id, slug: chapterSlug } },
    });

    if (!chapter) return res.status(404).json({ error: "Chapter not found" });
    res.json(chapter);
  } catch (err) {
    console.error("❌ Error fetching chapter:", err);
    res.status(500).json({ error: "Failed to load chapter" });
  }
});

export default router;
