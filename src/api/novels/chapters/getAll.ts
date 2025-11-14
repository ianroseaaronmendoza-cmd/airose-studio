import express from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// GET /api/novels/:novelSlug/chapters
router.get("/novels/:novelSlug/chapters", async (req, res) => {
  try {
    const { novelSlug } = req.params;
    const novel = await prisma.novel.findUnique({
      where: { slug: novelSlug },
      include: { chapters: { orderBy: { position: "asc" } } },
    });
    if (!novel) return res.status(404).json({ error: "Novel not found" });
    res.json(novel.chapters);
  } catch (err) {
    console.error("❌ Error fetching chapters:", err);
    res.status(500).json({ error: "Failed to load chapters" });
  }
});

export default router;
