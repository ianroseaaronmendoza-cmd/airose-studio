import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* Ensure upload directory exists */
const uploadPath = path.join(process.cwd(), "uploads", "projects");
fs.mkdirSync(uploadPath, { recursive: true });

/* Multer config */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploader = multer({ storage });

router.post("/api/uploads/projects", uploader.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const url = `/uploads/projects/${req.file.filename}`;
  res.json({ url });
});

export default router;
