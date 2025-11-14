import express from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// PUT /api/novels/:novelSlug/chapters/:chapterSlug
router.put("/novels/:novelSlug/chapters/:chapterSlug", async (req, res) => {
  try {
    const { novelSlug, chapterSlug } = req.params;
    const { title, body, slug } = req.body;

    const novel = await prisma.novel.findUnique({ where: { slug: novelSlug } });
    if (!novel) return res.status(404).json({ error: "Novel not found" });

    const existing = await prisma.chapter.findUnique({
      where: { novelId_slug: { novelId: novel.id, slug: chapterSlug } },
    });
    if (!existing) return res.status(404).json({ error: "Chapter not found" });

    const updated = await prisma.chapter.update({
      where: { id: existing.id },
      data: {
        title: title ?? existing.title,
        body: body ?? existing.body,
        slug: slug ?? existing.slug,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating chapter:", err);
    res.status(500).json({ error: "Failed to update chapter" });
  }
});

export default router;
