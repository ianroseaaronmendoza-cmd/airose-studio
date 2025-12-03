const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "../public/uploads/novels/originals");
const targetDir = path.join(__dirname, "../backups/original-images");

if (fs.existsSync(sourceDir)) {
  // Create backups directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Move originals folder
  fs.renameSync(sourceDir, targetDir);
  
  console.log("✅ Moved originals to /backups/original-images/");
  console.log("   (They're no longer part of your public build)");
} else {
  console.log("⚠️  No originals folder found");
}