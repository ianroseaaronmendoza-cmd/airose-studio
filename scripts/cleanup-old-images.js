const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../public/uploads/novels");

console.log("🗑️  Cleaning up old PNG/JPG files...\n");

let deletedCount = 0;

fs.readdirSync(uploadsDir).forEach((file) => {
  // Only delete PNG/JPG files (not WebP)
  if (!/\.(png|jpg|jpeg)$/i.test(file)) return;

  const filePath = path.join(uploadsDir, file);
  const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, ".webp");

  // Only delete if WebP version exists
  if (fs.existsSync(webpPath)) {
    fs.unlinkSync(filePath);
    deletedCount++;
    console.log(`🗑️  Deleted: ${file} (WebP version exists)`);
  } else {
    console.log(`⚠️  Kept: ${file} (no WebP version found)`);
  }
});

console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} old image(s).`);
console.log("💾 Originals are backed up in /originals folder");