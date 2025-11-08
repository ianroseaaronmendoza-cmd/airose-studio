// src/api/blogs/update.ts
import express, { Request, Response } from "express";
import { prisma } from "../../../lib/prisma"; // ✅ fixed

const router = express.Router();

/**
 * ✏️ Update an existing blog post by slug
 * Works with: PUT /api/blogs/:slug
 */
router.put("/blogs/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { title, content, coverImage } = req.body;

  console.log("📝 PUT /api/blogs/:slug called");
  console.log("Params:", req.params);
  console.log("Body:", { title, hasContent: !!content, coverImage });

  try {
    if (!slug) return res.status(400).json({ error: "Missing slug" });
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" });

    const updated = await prisma.blog.update({
      where: { slug },
      data: {
        title,
        content,
        coverImage: coverImage || null,
        updatedAt: new Date(),
      },
    });

    console.log("✅ Blog updated successfully:", updated.slug);
    res.json(updated);
  } catch (err: any) {
    console.error("❌ Error updating blog:", err);
    res.status(500).json({ error: "Failed to update blog", details: err.message });
  }
});

export default router;
