// src/api/blogs.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const router = express.Router();
const prisma = new PrismaClient();

// 🧠 Utility: Create a unique slug (in case of duplicates)
async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

// ──────────────────────────────────────────────
// 📖 GET all blogs
// ──────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(blogs);
  } catch (err) {
    console.error("❌ Error fetching blogs:", err);
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// ──────────────────────────────────────────────
// 📘 GET single blog by slug
// ──────────────────────────────────────────────
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
    });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    return res.status(200).json(blog);
  } catch (err) {
    console.error("❌ Error fetching blog:", err);
    return res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// ──────────────────────────────────────────────
// ✏️ CREATE blog
// ──────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, content, coverImage } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const slug = await generateUniqueSlug(title);

    const blog = await prisma.blog.create({
      data: { title, slug, content, coverImage },
    });

    return res.status(201).json(blog);
  } catch (err) {
    console.error("❌ Error creating blog:", err);
    return res.status(500).json({ error: "Failed to create blog" });
  }
});

// ──────────────────────────────────────────────
// 🛠 UPDATE blog
// ──────────────────────────────────────────────
router.put("/:slug", async (req: Request, res: Response) => {
  try {
    const { title, content, coverImage } = req.body;

    const existing = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
    });
    if (!existing) return res.status(404).json({ error: "Blog not found" });

    const blog = await prisma.blog.update({
      where: { slug: req.params.slug },
      data: { title, content, coverImage },
    });

    return res.status(200).json(blog);
  } catch (err) {
    console.error("❌ Error updating blog:", err);
    return res.status(500).json({ error: "Failed to update blog" });
  }
});

// ──────────────────────────────────────────────
// 🗑 DELETE blog
// ──────────────────────────────────────────────
router.delete("/:slug", async (req: Request, res: Response) => {
  try {
    const existing = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
    });
    if (!existing) return res.status(404).json({ error: "Blog not found" });

    await prisma.blog.delete({ where: { slug: req.params.slug } });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error deleting blog:", err);
    return res.status(500).json({ error: "Failed to delete blog" });
  }
});

export default router;
