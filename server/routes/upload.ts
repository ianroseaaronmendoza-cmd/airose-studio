import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const router = express.Router();

// Temporary storage for uploaded files
const upload = multer({
  dest: path.join(__dirname, "../../public/uploads/temp"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const uploadsDir = path.join(__dirname, "../../public/uploads/novels");

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload and optimize image
router.post("/blog-image", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const optimizedName = `${timestamp}-${baseName}.webp`; // Always use WebP
    const outputPath = path.join(uploadsDir, optimizedName);

    // Optimize image with sharp
    await sharp(req.file.path)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toFile(outputPath);

    // Delete temporary uploaded file
    fs.unlinkSync(req.file.path);

    const url = `/uploads/novels/${optimizedName}`;
    
    console.log(`✅ Image optimized: ${optimizedName}`);
    
    res.json({ ok: true, url });
  } catch (err) {
    console.error("Image optimization failed:", err);
    
    // Clean up temp file if it still exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: "Failed to process image" });
  }
});

export default router;