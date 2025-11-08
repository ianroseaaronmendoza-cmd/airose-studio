import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/blogs
router.get("/blogs", async (_req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(blogs);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

export default router;
