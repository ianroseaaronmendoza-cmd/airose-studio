import express from "express";
import prisma from "@/lib/prisma";   // adjust path if needed

const router = express.Router();

// PATCH /api/novels/:novelSlug/chapters/reorder
router.patch("/novels/:novelSlug/chapters/reorder", async (req, res) => {
  const { novelSlug } = req.params;
  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Invalid order array" });
  }

  try {
    const novel = await prisma.novel.findUnique({
      where: { slug: novelSlug },
      include: { chapters: true },
    });

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const map = new Map(novel.chapters.map((c) => [c.slug, c]));

    // create prisma operations
    const ops = order
      .map((slug, idx) => {
        const ch = map.get(slug);
        if (!ch) return null;

        return prisma.chapter.update({
          where: { id: ch.id },
          data: { position: idx + 1 },
        });
      })
      .filter(Boolean) as any[];

    // run transaction
    await prisma.$transaction(ops);

    const updated = await prisma.chapter.findMany({
      where: { novelId: novel.id },
      orderBy: { position: "asc" },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error reordering chapters:", err);
    res.status(500).json({ error: "Failed to reorder chapters" });
  }
});

export default router;
