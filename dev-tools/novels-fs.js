// dev-tools/novels-fs.js
const fs = require("fs");
const path = require("path");

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
}

//
// Utility: load or create JSON file
//
function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("Failed reading JSON:", filePath, err);
    return fallback;
  }
}

function writeJson(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed writing JSON:", filePath, err);
    throw err;
  }
}

//
// Paths
//
const BASE = path.join(process.cwd(), "public", "data", "novels");
const INDEX_PATH = path.join(BASE, "index.json");

//
// Helper: get novel folder paths
//
function novelFolder(slug) {
  return path.join(BASE, slug);
}
function novelMetaPath(slug) {
  return path.join(BASE, slug, "meta.json");
}
function chapterFolder(slug) {
  return path.join(BASE, slug, "chapters");
}
function chapterIndexPath(slug) {
  return path.join(BASE, slug, "chapters", "index.json");
}
function chapterFilePath(novelSlug, chapterSlug) {
  return path.join(BASE, novelSlug, "chapters", `${chapterSlug}.json`);
}

//
// 1) SAVE NOVEL META (Create or Update)
//

function saveNovelMeta(meta) {
  ensureDev();
  
  const { slug, title, summary, note, coverUrl, updatedAt } = meta;

  if (!slug) throw new Error("Novel slug missing");
  if (!title) throw new Error("Novel title missing");

  // Load global index
  const list = readJson(INDEX_PATH, []);

  const existingIndex = list.findIndex((n) => n.slug === slug);

  const condensed = {
    slug,
    title,
    summary: summary || "",
    note: note || "",
    coverUrl: coverUrl || "",
    updatedAt: updatedAt || Date.now(),
  };

  // Update or add
  if (existingIndex >= 0) {
    list[existingIndex] = condensed;
  } else {
    list.push(condensed);
  }

  writeJson(INDEX_PATH, list);

  // Save full meta
  writeJson(novelMetaPath(slug), condensed);

  // Ensure chapters folder + index exists
  const chapterIndex = readJson(chapterIndexPath(slug), []);
  writeJson(chapterIndexPath(slug), chapterIndex);

  return condensed;
}

//
// 2) DELETE NOVEL
//
function deleteNovel(slug) {
  ensureDev();
  
  if (!slug) throw new Error("slug required");

  const list = readJson(INDEX_PATH, []);
  const newList = list.filter((n) => n.slug !== slug);
  writeJson(INDEX_PATH, newList);

  // Delete folder recursively
  const folder = novelFolder(slug);
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

//
// 3) SAVE CHAPTER
//
function saveChapter({ novelSlug, chapterSlug, title, html, updatedAt }) {
  ensureDev();
  
  if (!novelSlug) throw new Error("Missing novelSlug");
  if (!chapterSlug) throw new Error("Missing chapterSlug");

  const chapterPath = chapterFilePath(novelSlug, chapterSlug);
  const indexPath = chapterIndexPath(novelSlug);

  const chapterIndex = readJson(indexPath, []);

  const now = updatedAt || Date.now();

  // Create or update chapter entry inside index.json
  const entry = {
    slug: chapterSlug,
    title: title || "Untitled Chapter",
    updatedAt: now,
  };

  const existing = chapterIndex.findIndex((ch) => ch.slug === chapterSlug);

  if (existing >= 0) {
    chapterIndex[existing] = { ...chapterIndex[existing], ...entry };
  } else {
    // default position: add to end
    entry.position = chapterIndex.length + 1;
    chapterIndex.push(entry);
  }

  // Save index
  writeJson(indexPath, chapterIndex);

  // Save actual chapter content
  writeJson(chapterPath, {
    slug: chapterSlug,
    novelSlug,
    title: entry.title,
    updatedAt: now,
    body: html || "",
  });

  return entry;
}

//
// 4) DELETE CHAPTER
//
function deleteChapter(novelSlug, chapterSlug) {
  ensureDev();
  
  if (!novelSlug || !chapterSlug) throw new Error("Missing parameters");

  const indexPath = chapterIndexPath(novelSlug);
  const chapterIndex = readJson(indexPath, []);

  const newIndex = chapterIndex.filter((ch) => ch.slug !== chapterSlug);
  writeJson(indexPath, newIndex);

  const filePath = chapterFilePath(novelSlug, chapterSlug);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

//
// 5) REORDER CHAPTERS
// newOrder = [ "chapter-1", "chapter-3", "chapter-2", ... ]
//
function reorderChapters(novelSlug, newOrder) {
  ensureDev();
  
  if (!Array.isArray(newOrder)) throw new Error("newOrder must be array");
  const indexPath = chapterIndexPath(novelSlug);
  const chapterIndex = readJson(indexPath, []);

  const map = new Map();
  chapterIndex.forEach((ch) => map.set(ch.slug, ch));

  const reordered = newOrder.map((slug, i) => {
    const item = map.get(slug);
    if (!item) return null;
    return {
      ...item,
      position: i + 1,
    };
  }).filter(Boolean);

  writeJson(indexPath, reordered);

  return reordered;
}

module.exports = {
  saveNovelMeta,
  deleteNovel,
  saveChapter,
  deleteChapter,
  reorderChapters,
};
