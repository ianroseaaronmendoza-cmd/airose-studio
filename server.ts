// server.ts — JSON-only Local Dev Helper Server
// ----------------------------------------------
// • Runs ONLY on localhost
// • Provides API to save JSON files (music, blogs, poems, etc.)
// • Serves React build from /dist
// • No backend logic, no auth, no prisma
// ----------------------------------------------

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

// -----------------------------
// Utility: Write JSON helper
// -----------------------------
function writeJson(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("❌ JSON write failed:", err);
    return false;
  }
}

// -----------------------------
// API: Save JSON (LOCAL ONLY)
// -----------------------------
app.post("/api/save-json", (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !filename.endsWith(".json")) {
    return res.status(400).json({
      error: "Invalid filename. Must end with .json",
    });
  }

  const filePath = path.join(process.cwd(), "data", filename);

  const ok = writeJson(filePath, content);

  if (!ok) return res.status(500).json({ error: "Failed to write JSON file" });

  return res.json({ ok: true, message: "JSON saved", file: filename });
});

// -----------------------------
// SPA Frontend (React)
// -----------------------------
const clientPath = path.join(process.cwd(), "dist");
if (fs.existsSync(clientPath)) {
  console.log("📦 Serving frontend from:", clientPath);

  // 1) Serve static assets
  app.use(express.static(clientPath));

  // 2) Fallback middleware for all other GET requests
  app.use((req, res, next) => {
    // Let API routes and non-GET methods pass through
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();

    // For anything else, serve the SPA index.html
    res.sendFile(path.join(clientPath, "index.html"), (err) => {
      if (err) {
        next(err);
      }
    });
  });
} else {
  console.warn("⚠️ No dist/ folder found. Build frontend first.");
}

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Local JSON server running at http://localhost:${PORT}`);
});