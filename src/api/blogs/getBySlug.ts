import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/blogs/:slug
router.get("/blogs/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

export default router;
