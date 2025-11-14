import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

/* ---------------------------------------------------------
   GET /api/projects
--------------------------------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });

    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch projects" });
  }
});

/* ---------------------------------------------------------
   GET /api/projects/:slug
--------------------------------------------------------- */
router.get("/:slug", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch project" });
  }
});

/* ---------------------------------------------------------
   POST /api/projects
--------------------------------------------------------- */
router.post("/", async (req, res) => {
  const { title, summary, content, slug } = req.body;

  try {
    const created = await prisma.project.create({
      data: { title, summary, content, slug },
    });

    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create project" });
  }
});

/* ---------------------------------------------------------
   PUT /api/projects/:slug
--------------------------------------------------------- */
router.put("/:slug", async (req, res) => {
  const oldSlug = req.params.slug;
  const { title, summary, content, newSlug } = req.body;

  try {
    const updated = await prisma.project.update({
      where: { slug: oldSlug },
      data: {
        title,
        summary,
        content,
        slug: newSlug || oldSlug,
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update project" });
  }
});

/* ---------------------------------------------------------
   DELETE /api/projects/:slug
--------------------------------------------------------- */
router.delete("/:slug", async (req, res) => {
  try {
    const deleted = await prisma.project.delete({
      where: { slug: req.params.slug },
    });

    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete project" });
  }
});

export default router;
