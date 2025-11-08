import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// DELETE /api/blogs/:id
router.delete("/blogs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.blog.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

export default router;
