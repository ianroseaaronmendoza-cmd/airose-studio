import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// GET /api/novels/:slug
router.get("/novels/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const novel = await prisma.novel.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { position: "asc" } } },
    });
    if (!novel) return res.status(404).json({ error: "Novel not found" });
    res.json(novel);
  } catch (err) {
    console.error("❌ Error fetching novel:", err);
    res.status(500).json({ error: "Failed to load novel" });
  }
});

export default router;
