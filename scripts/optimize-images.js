const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../public/uploads/novels");

// Create backup directory
const backupDir = path.join(uploadsDir, "originals");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

console.log("🖼️  Starting image optimization...\n");

fs.readdirSync(uploadsDir).forEach(async (file) => {
  // Skip directories and non-image files
  if (!/\.(png|jpg|jpeg)$/i.test(file)) return;

  const inputPath = path.join(uploadsDir, file);
  const backupPath = path.join(backupDir, file);
  const stats = fs.statSync(inputPath);
  const originalSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  try {
    // Backup original
    fs.copyFileSync(inputPath, backupPath);

    // Optimize and overwrite
    await sharp(inputPath)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp"));

    // Get new file size
    const newPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    const newStats = fs.statSync(newPath);
    const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
    const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

    console.log(`✅ ${file}`);
    console.log(`   ${originalSizeMB} MB → ${newSizeMB} MB (${savings}% smaller)\n`);

    // Delete old PNG/JPG (optional - uncomment to delete)
    // fs.unlinkSync(inputPath);
  } catch (err) {
    console.error(`❌ Failed: ${file}`, err.message, "\n");
  }
});

console.log("✨ Optimization complete! Originals backed up to /originals folder");