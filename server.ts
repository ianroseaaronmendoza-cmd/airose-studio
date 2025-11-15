// server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";

// 🧩 Fix BigInt JSON serialization
if (typeof (BigInt.prototype as any).toJSON !== "function") {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

// ──────────────────────────────────────────────
// 🔧 Load environment
// ──────────────────────────────────────────────
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Validate required secrets
if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
  console.error("❌ Missing ADMIN_PASSWORD or JWT_SECRET in .env");
  process.exit(1);
}

// ──────────────────────────────────────────────
// ⚙ Middleware
// ──────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Request logger
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// 🌐 CORS — TEMPORARY OPEN FOR RENDER DEPLOYMENT
// (we will restrict it after you get your final Render URL)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
// 📝 BLOG ROUTES
// ──────────────────────────────────────────────
import blogsRouter from "./src/api/blogs";
app.use("/api/blogs", blogsRouter);

// ──────────────────────────────────────────────
// 📦 PROJECT ROUTES
// ──────────────────────────────────────────────
import projectsRouter from "./src/api/projects";
app.use("/api/projects", projectsRouter);

// ──────────────────────────────────────────────
// ✍️ POEMS ROUTES (Legacy)
// ──────────────────────────────────────────────
import writingsPoems from "./src/api/writings/poems";
import writingsSave from "./src/api/writings/save";
import writingsDelete from "./src/api/writings/delete";

app.use("/api/writings", writingsPoems);
app.use("/api/writings", writingsSave);
app.use("/api/writings", writingsDelete);

// ──────────────────────────────────────────────
// 🎵 MUSIC ROUTES (Local Storage)
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
// 📚 NOVELS + CHAPTERS ROUTES
// ──────────────────────────────────────────────
import novelsGetAll from "./src/api/novels/getAll";
import novelsGetBySlug from "./src/api/novels/getBySlug";
import novelsCreate from "./src/api/novels/create";
import novelsUpdate from "./src/api/novels/update";
import novelsDelete from "./src/api/novels/delete";

import chaptersGetAll from "./src/api/novels/chapters/getAll";
import chaptersGetBySlug from "./src/api/novels/chapters/getBySlug";
import chaptersCreate from "./src/api/novels/chapters/create";
import chaptersUpdate from "./src/api/novels/chapters/update";
import chaptersDelete from "./src/api/novels/chapters/delete";
import chaptersReorder from "./src/api/novels/chapters/reorder";

app.use("/api", novelsGetAll);
app.use("/api", novelsGetBySlug);
app.use("/api", novelsCreate);
app.use("/api", novelsUpdate);
app.use("/api", novelsDelete);

app.use("/api", chaptersGetAll);
app.use("/api", chaptersGetBySlug);
app.use("/api", chaptersCreate);
app.use("/api", chaptersUpdate);
app.use("/api", chaptersDelete);
app.use("/api", chaptersReorder);

// ──────────────────────────────────────────────
// 📤 IMAGE UPLOADS — PROJECTS
// ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(process.cwd(), "uploads/projects");
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const uploader = multer({ storage });

app.post("/api/uploads/projects", uploader.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `/uploads/projects/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get("host")}${fileUrl}`;
  res.json({ url: fullUrl });
});

// ──────────────────────────────────────────────
// 📤 IMAGE UPLOADS — BLOGS + GENERAL UPLOAD
// ──────────────────────────────────────────────
import uploadRouter from "./src/api/upload";
app.use(uploadRouter);

// serve static uploaded files (absolute path)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ──────────────────────────────────────────────
// 🩺 Health Check
// ──────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server running successfully 🚀" });
});

// ──────────────────────────────────────────────
// API 404 CATCHER
// ──────────────────────────────────────────────
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// ──────────────────────────────────────────────
// 🖥️ SPA Frontend Fallback (React Router)
// ──────────────────────────────────────────────
const clientPath = path.join(process.cwd(), "dist");

if (fs.existsSync(clientPath)) {
  console.log("📦 Serving frontend from:", clientPath);
  app.use(express.static(clientPath));

  // React Router fallback (must be last non-error route)
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  console.warn("⚠️ Frontend build not found — skipping static serve.");
}

// ──────────────────────────────────────────────
// 🐛 Centralized Error Handler
// ──────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("💥 Unhandled error:", err);

  if (req.path.startsWith("/api")) {
    return res.status(500).json({
      error: err?.message || "Internal Server Error",
    });
  }

  res.status(500).send("Internal Server Error");
});

// ──────────────────────────────────────────────
// 🚀 Start server
// ──────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});

export default app;
