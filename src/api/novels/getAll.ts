import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// GET /api/novels
router.get("/novels", async (_req: Request, res: Response) => {
  try {
    const novels = await prisma.novel.findMany({
      orderBy: { updatedAt: "desc" },
      include: { chapters: { orderBy: { position: "asc" } } },
    });
    res.json(novels);
  } catch (err) {
    console.error("❌ Error fetching novels:", err);
    res.status(500).json({ error: "Failed to load novels" });
  }
});

export default router;
