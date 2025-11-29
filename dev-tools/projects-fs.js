// dev-tools/projects-fs.js
const fs = require("fs");
const path = require("path");

const PROJECT_DIR = path.join(process.cwd(), "public", "data", "projects");
const INDEX_PATH = path.join(PROJECT_DIR, "index.json");

function ensureDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Editing projects is allowed only in development mode.");
  }
}

function loadIndex() {
  try {
    if (!fs.existsSync(INDEX_PATH)) return [];
    return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  } catch (err) {
    console.error("Failed to load projects index:", err);
    return [];
  }
}

function saveIndex(list) {
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(list, null, 2), "utf8");
}

function getProject(slug) {
  const p = path.join(PROJECT_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    console.error("Failed to parse project file:", p, err);
    return null;
  }
}

function saveProject(project) {
  ensureDev();

  if (!project || !project.slug) {
    throw new Error("Project object with 'slug' required.");
  }

  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  const filePath = path.join(PROJECT_DIR, `${project.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(project, null, 2), "utf8");

  // Update index
  let index = loadIndex();
  const existing = index.find((p) => p.slug === project.slug);
  if (existing) {
    existing.title = project.title;
    existing.summary = project.summary || "";
    existing.createdAt = project.createdAt || existing.createdAt || Date.now();
  } else {
    index.push({
      slug: project.slug,
      title: project.title,
      summary: project.summary || "",
      createdAt: project.createdAt || Date.now(),
    });
  }

  // Keep index sorted by createdAt descending (most recent first)
  index.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  saveIndex(index);

  return project;
}

function deleteProject(slug) {
  ensureDev();

  const filePath = path.join(PROJECT_DIR, `${slug}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  let index = loadIndex().filter((p) => p.slug !== slug);
  saveIndex(index);

  return true;
}

module.exports = {
  getProject,
  saveProject,
  deleteProject,
  loadIndex, // used only if needed
};
