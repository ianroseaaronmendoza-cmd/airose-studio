import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// POST /api/novels
router.post("/novels", async (req: Request, res: Response) => {
  try {
    const { title, slug, summary, note, coverUrl } = req.body;
    if (!title || !slug) return res.status(400).json({ error: "Missing title or slug" });

    const created = await prisma.novel.create({
      data: { title, slug, summary, note, coverUrl },
    });

    res.status(201).json(created);
  } catch (err: any) {
    console.error("❌ Error creating novel:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Slug already exists" });
    }
    res.status(500).json({ error: "Failed to create novel" });
  }
});

export default router;
