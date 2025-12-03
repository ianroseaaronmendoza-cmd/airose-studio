const fs = require("fs");
const path = require("path");

const novelsDir = path.join(__dirname, "../public/data/novels");

console.log("📝 Updating novel image references...\n");

// Read all JSON files in novels directory
fs.readdirSync(novelsDir).forEach((file) => {
  if (!file.endsWith(".json")) return;

  const filePath = path.join(novelsDir, file);
  const content = fs.readFileSync(filePath, "utf-8");
  const novel = JSON.parse(content);

  // Replace .png/.jpg/.jpeg with .webp in content
  if (novel.content) {
    const original = novel.content;
    novel.content = novel.content.replace(
      /\/uploads\/novels\/([^'"]+)\.(png|jpg|jpeg)/gi,
      "/uploads/novels/$1.webp"
    );

    if (original !== novel.content) {
      // Save updated content
      fs.writeFileSync(filePath, JSON.stringify(novel, null, 2));
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`⏭️  Skipped: ${file} (no images found)`);
    }
  }
});

console.log("\n✨ All novel files updated!");