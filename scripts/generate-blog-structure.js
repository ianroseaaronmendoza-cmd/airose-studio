const fs = require("fs");
const path = require("path");

const blogsDir = path.join(process.cwd(), "public", "data", "blogs");

if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
  console.log("Created:", blogsDir);
}

// Create index.json if missing
const indexPath = path.join(blogsDir, "index.json");
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, "[]");
  console.log("Created:", indexPath);
}

console.log("Blog structure ready.");
