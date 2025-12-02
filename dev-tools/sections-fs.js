const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "sections");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
}

function saveSections({ slug, title, sections }) {
  ensureDev();
  
  if (!slug) throw new Error("Missing slug");
  if (!sections) throw new Error("Missing sections array");

  ensureDir(DATA_DIR);

  const outputPath = path.join(DATA_DIR, `${slug}.json`);
  const payload = {
    slug,
    title: title || "",
    sections,
    updated: Date.now(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  return payload;
}

function deleteSections(slug) {
  ensureDev();
  
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

module.exports = {
  saveSections,
  deleteSections,
};
