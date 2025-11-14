// src/api/upload.ts
import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --------------
// Multer Storage
// --------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `raw-${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

// File type validation
function fileFilter(_req: Request, file: Express.Multer.File, cb: any) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG, PNG, WEBP allowed."));
  }
  cb(null, true);
}

// Max file size: 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Extend Express Request type
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// --------------------------
// POST /api/upload
// --------------------------
router.post("/api/upload", upload.single("file"), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const tempPath = req.file.path;

    // Final processed filename
    const ext = path.extname(req.file.originalname).toLowerCase();
    const finalName = `cover-${Date.now()}${ext}`;
    const finalPath = path.join(uploadDir, finalName);

    // Process with Sharp
    await sharp(tempPath)
      .resize({ width: 600 })
      .jpeg({ quality: 80 })
      .toFile(finalPath);

    // ------------------------------
    // SAFE: Async delete, non-blocking
    // ------------------------------
    fs.unlink(tempPath, (err) => {
      if (err) {
        console.warn("⚠ Failed to delete temp file:", err.message);
      }
    });

    // Return RELATIVE url
    return res.json({ url: `/uploads/${finalName}` });

  } catch (err: any) {
    console.error("❌ Upload error:", err.message);
    return res.status(500).json({ error: "Image processing failed." });
  }
});

export default router;
