// scripts/init-novels.js
const fs = require("fs");
const path = require("path");

const base = path.join(process.cwd(), "public", "data", "novels");
const indexPath = path.join(base, "index.json");

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log("Created:", p);
  }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  console.log("Created:", p);
}

(function init() {
  try {
    // Create base novels folder
    ensureDir(base);

    // Create novels index.json
    if (!fs.existsSync(indexPath)) {
      writeJson(indexPath, []);
    } else {
      console.log("Already exists:", indexPath);
    }

    console.log("Novels structure ready.");
  } catch (err) {
    console.error("Error initializing novels:", err);
  }
})();
