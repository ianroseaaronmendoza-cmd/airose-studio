// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

// ──────────────────────────────────────────────
// 🔧 Load environment
// ──────────────────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ──────────────────────────────────────────────
// 🩵 Environment validation
// ──────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_PASSWORD || !JWT_SECRET) {
  console.error("❌ Missing ADMIN_PASSWORD or JWT_SECRET in .env");
  process.exit(1);
}

// ──────────────────────────────────────────────
// ⚙️ Middleware setup
// ──────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Explicit CORS — must be before routes
const FRONTEND_DEV = "http://localhost:3000";

app.use(
  cors({
    origin: [FRONTEND_DEV],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Enable proxy trust in production (needed for secure cookies)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ──────────────────────────────────────────────
// 🧩 Logging (helpful diagnostics)
// ──────────────────────────────────────────────
console.log("🚀 Starting Airose Studio Backend...");
console.log("🌿 Environment:", process.env.NODE_ENV);
console.log("📁 Port:", PORT);
console.log("🔒 Admin Password:", ADMIN_PASSWORD ? "✔ Loaded" : "❌ Missing");
console.log("🔑 JWT Secret:", JWT_SECRET ? "✔ Loaded" : "❌ Missing");

// ──────────────────────────────────────────────
// 🔐 AUTH ROUTES
// ──────────────────────────────────────────────
import editorLogin from "./src/api/auth/editor-login";
import checkEditor from "./src/api/auth/check-editor";
import editorLogout from "./src/api/auth/editor-logout";

app.use("/api", editorLogin);
app.use("/api", checkEditor);
app.use("/api", editorLogout);

// ──────────────────────────────────────────────
// 🖋 WRITINGS ROUTES
// ──────────────────────────────────────────────
import writingsPoems from "./src/api/writings/poems";
import writingsSave from "./src/api/writings/save";
import writingsDelete from "./src/api/writings/delete";

app.use("/api/writings", writingsPoems);
app.use("/api/writings", writingsSave);
app.use("/api/writings", writingsDelete);

// ──────────────────────────────────────────────
// 🎵 MUSIC ROUTES
// ──────────────────────────────────────────────
import saveRoute from "./src/api/music/save";
import deleteRoute from "./src/api/music/delete";
import loadRoute from "./src/api/music/load";
import reorderRoute from "./src/api/music/reorder";

app.use(saveRoute);
app.use(deleteRoute);
app.use(loadRoute);
app.use(reorderRoute);

// ──────────────────────────────────────────────
// 🩺 Health Check
// ──────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server running successfully 🚀",
  });
});

// ──────────────────────────────────────────────
// 🌐 Serve frontend (SPA fallback)
// Express 5.x compatible — no PathError
// ──────────────────────────────────────────────
const __dirnamePath = path.resolve();
const clientPath = path.join(__dirnamePath, "dist"); // or "build" if you use CRA

app.use(express.static(clientPath));

// Regex-based fallback route (Express 5 safe)
app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ──────────────────────────────────────────────
// 🚀 Start Server
// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
