// src/api/writings/delete.ts
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import { updatePoemsCache } from "./poems";

const router = Router();

router.post("/delete", async (req: Request, res: Response) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: "Missing slug" });

    const filePath = path.join(process.cwd(), "data", "writings.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(data.poems)) {
      return res.status(400).json({ error: "Invalid poems data" });
    }

    const beforeCount = data.poems.length;
    data.poems = data.poems.filter((p: any) => p.slug !== slug);

    if (data.poems.length === beforeCount) {
      return res.status(404).json({ error: "Poem not found" });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    updatePoemsCache(data);

    console.log(`🗑️ Deleted poem: ${slug}`);
    res.json({ success: true, deleted: true, slug });
  } catch (err: any) {
    console.error("Delete poem error:", err);
    res.status(500).json({ error: "Failed to delete poem" });
  }
});

export default router;
