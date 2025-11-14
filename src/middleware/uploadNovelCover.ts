// src/middleware/uploadNovelCover.ts
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Ensure /uploads/novels exists
const uploadDir = path.join(process.cwd(), "uploads", "novels");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage (temporary raw file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "raw"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "raw-" + unique + path.extname(file.originalname));
  },
});

export const uploadNovelCover = multer({ storage });

// Process uploaded file with Sharp
export async function processNovelCover(
  req: any,
  res: any,
  next: any
) {
  if (!req.file) return next();

  try {
    const rawPath = req.file.path;

    const finalName = "cover-" + Date.now() + ".jpg";
    const finalPath = path.join(uploadDir, finalName);

    await sharp(rawPath)
      .resize(600, 900, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(finalPath);

    // SAFE delete — won't crash
    fs.unlink(rawPath, (err) => {
      if (err) console.warn("⚠️ Could not delete temp file:", err.message);
    });

    // Save URL for database
    req.body.coverUrl = `/uploads/novels/${finalName}`;

    next();
  } catch (err: any) {
    console.error("❌ Error processing cover image:", err);
    res.status(500).json({ error: "Image processing failed" });
  }
}
