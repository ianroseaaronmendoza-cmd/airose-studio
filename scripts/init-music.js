// scripts/init-music.js
const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "public", "data");
const file = path.join(dir, "music.json");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("Created:", dir);
}

if (!fs.existsSync(file)) {
  const template = { albums: [] };
  fs.writeFileSync(file, JSON.stringify(template, null, 2), "utf8");
  console.log("Created:", file);
} else {
  console.log("music.json already exists:", file);
}
