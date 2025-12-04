// scripts/fix-chapter-images.js
const fs = require("fs");
const path = require("path");

const novelsDir = path.join(__dirname, "../public/data/novels");

let fixedCount = 0;

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const original = content;
  
  // Replace .png/.jpg/.jpeg with .webp
  const fixed = content.replace(
    /\/uploads\/novels\/([^"']+)\.(png|jpg|jpeg)/gi,
    "/uploads/novels/$1.webp"
  );
  
  if (original !== fixed) {
    fs.writeFileSync(filePath, fixed);
    fixedCount++;
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
}

console.log("🔍 Scanning for image references...\n");

// Scan all novel directories
fs.readdirSync(novelsDir).forEach((novelSlug) => {
  const novelPath = path.join(novelsDir, novelSlug);
  
  if (!fs.statSync(novelPath).isDirectory()) return;
  
  // Fix novel metadata
  const metaPath = path.join(novelPath, "novel.json");
  if (fs.existsSync(metaPath)) {
    fixFile(metaPath);
  }
  
  // Fix chapters
  const chaptersDir = path.join(novelPath, "chapters");
  if (fs.existsSync(chaptersDir)) {
    fs.readdirSync(chaptersDir).forEach((file) => {
      if (file.endsWith(".json")) {
        fixFile(path.join(chaptersDir, file));
      }
    });
  }
});

console.log(`\n✨ Complete! Fixed ${fixedCount} file(s)`);