const fs = require("fs");
const path = require("path");

const POEM_DIR = path.join(process.cwd(), "public", "data", "poems");
const INDEX_PATH = path.join(POEM_DIR, "index.json");

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
}

function loadIndex() {
  try {
    if (!fs.existsSync(INDEX_PATH)) return [];
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load poems index:", err);
    return [];
  }
}

function saveIndex(list) {
  fs.mkdirSync(POEM_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(list, null, 2), "utf8");
}

function savePoem(poem) {
  ensureDev();
  fs.mkdirSync(POEM_DIR, { recursive: true });

  const filePath = path.join(POEM_DIR, `${poem.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(poem, null, 2), "utf8");

  // update index
  let index = loadIndex();
  const existing = index.find((p) => p.slug === poem.slug);

  if (existing) {
    Object.assign(existing, poem);
  } else {
    index.push(poem);
  }

  // newest first
  index.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  saveIndex(index);
  return poem;
}

function deletePoem(slug) {
  ensureDev();

  const filePath = path.join(POEM_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  let index = loadIndex();
  index = index.filter((p) => p.slug !== slug);
  saveIndex(index);

  return true;
}

function getPoem(slug) {
  const filePath = path.join(POEM_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = {
  savePoem,
  deletePoem,
  getPoem,
  loadIndex,
};