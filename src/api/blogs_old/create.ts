import express from "express";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/blogs
router.post("/blogs", async (req, res) => {
  const { title, content, coverImage } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const slug = slugify(title, { lower: true, strict: true });

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        content: content || "",
        coverImage: coverImage || null,
      },
    });

    res.status(201).json(newBlog);
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
});

export default router;
