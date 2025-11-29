// scripts/init-projects.js
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "public", "data", "projects");
const indexPath = path.join(dir, "index.json");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("Created:", dir);
}

if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, "[]", "utf8");
  console.log("Created:", indexPath);
}

console.log("Projects initializer done.");
