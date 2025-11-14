import express from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// POST /api/novels/:novelSlug/chapters
router.post("/novels/:novelSlug/chapters", async (req, res) => {
  try {
    const { novelSlug } = req.params;
    const { title, slug, body } = req.body;

    const novel = await prisma.novel.findUnique({ where: { slug: novelSlug } });
    if (!novel) return res.status(404).json({ error: "Novel not found" });

    const position = (await prisma.chapter.count({ where: { novelId: novel.id } })) + 1;

    const created = await prisma.chapter.create({
      data: {
        title: title ?? "Untitled",
        slug,
        body: body ?? "",
        position,
        novel: { connect: { id: novel.id } },
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error("❌ Error creating chapter:", err);
    if (err.code === "P2002") return res.status(409).json({ error: "Chapter slug conflict" });
    res.status(500).json({ error: "Failed to create chapter" });
  }
});

export default router;
