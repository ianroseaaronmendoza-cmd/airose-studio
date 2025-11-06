// src/api/writings/poems.ts
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// 🧠 Local cache (to reduce file reads)
let cachedPoems: any = null;
let lastFetched = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

router.get("/poems", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cachedPoems && now - lastFetched < CACHE_TTL) {
      console.log("⚡ Serving poems from cache");
      return res.json(cachedPoems);
    }

    // ✅ Correct path for your file (works even in production build)
    const DATA_PATH = path.resolve(__dirname, "../../../data/writings.json");
    console.log("🧭 Reading poems from:", DATA_PATH);

    // Ensure file exists
    if (!fs.existsSync(DATA_PATH)) {
      console.error("❌ writings.json not found at:", DATA_PATH);
      return res.status(404).json({ error: "Poems data not found" });
    }

    // Read and parse file
    const fileContent = fs.readFileSync(DATA_PATH, "utf-8");
    const json = JSON.parse(fileContent);

    if (!json.poems || !Array.isArray(json.poems)) {
      throw new Error("Invalid JSON structure — missing 'poems' array");
    }

    cachedPoems = json;
    lastFetched = now;

    console.log(`✅ Poems loaded successfully (${json.poems.length} found)`);
    return res.json(json);
  } catch (err: any) {
    console.error("❌ Failed to load poems:", err.message);
    console.error(err.stack);
    return res.status(500).json({ error: "Failed to fetch poems" });
  }
});

// 🧩 Used by /save route to update cache instantly
export function updatePoemsCache(newData: any) {
  cachedPoems = newData;
  lastFetched = Date.now();
  console.log("✅ Poems cache updated instantly after save");
}

export default router;
