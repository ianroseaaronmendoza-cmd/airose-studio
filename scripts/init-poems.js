const fs = require("fs");
const path = require("path");

const folder = path.join(process.cwd(), "public", "data", "poems");
const index = path.join(folder, "index.json");

fs.mkdirSync(folder, { recursive: true });

if (!fs.existsSync(index)) {
  fs.writeFileSync(index, "[]", "utf8");
  console.log("Created:", index);
}

console.log("Poems initialized.");
