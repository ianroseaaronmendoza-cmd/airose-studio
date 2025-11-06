// src/api/writings/save.ts
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { updatePoemsCache } from "./poems";

const router = Router();

router.post("/save", async (req: Request, res: Response) => {
  try {
    const { slug, title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Missing title or content" });
    }

    const filePath = path.join(process.cwd(), "data", "writings.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(data.poems)) {
      return res.status(400).json({ error: "Invalid poems data" });
    }

    const now = new Date().toISOString();
    const newSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const existingIndex = data.poems.findIndex((p: any) => p.slug === slug);

    if (existingIndex >= 0) {
      // Slug changed? → remove old + add new
      if (slug !== newSlug) {
        console.log(`🔁 Slug updated from "${slug}" → "${newSlug}"`);
        data.poems.splice(existingIndex, 1);
        data.poems.unshift({
          slug: newSlug,
          title,
          content,
          date: now,
        });
      } else {
        // Just update existing
        data.poems[existingIndex] = {
          ...data.poems[existingIndex],
          title,
          content,
          date: now,
        };
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      updatePoemsCache(data);

      return res.json({
        success: true,
        updated: true,
        slug: newSlug,
        poem: { slug: newSlug, title, content, date: now },
      });
    }

    // Create new poem
    data.poems.unshift({ slug: newSlug, title, content, date: now });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    updatePoemsCache(data);

    console.log(`✅ Created new poem: ${title}`);
    res.json({
      success: true,
      created: true,
      slug: newSlug,
      poem: { slug: newSlug, title, content, date: now },
    });
  } catch (err: any) {
    console.error("Save poem error:", err);
    res.status(500).json({ error: "Failed to save poem" });
  }
});

export default router;
