import express from "express";
import prisma from "@/lib/prisma"; // adjust path if needed

const router = express.Router();

// DELETE /api/blogs/:slug
router.delete("/blogs/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    await prisma.blog.delete({
      where: { slug }
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

export default router;
