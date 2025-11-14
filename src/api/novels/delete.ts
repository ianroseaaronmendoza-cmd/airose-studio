import express, { Request, Response } from "express";
import prisma from "@/lib/prisma";

const router = express.Router();

// DELETE /api/novels/:slug
router.delete("/novels/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // delete cascades to chapters by Prisma schema onDelete Cascade
    const deleted = await prisma.novel.delete({ where: { slug } });
    res.json({ success: true, deleted });
  } catch (err: any) {
    console.error("❌ Error deleting novel:", err);
    if (err.code === "P2025") return res.status(404).json({ error: "Novel not found" });
    res.status(500).json({ error: "Failed to delete novel" });
  }
});

export default router;
