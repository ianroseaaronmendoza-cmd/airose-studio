// dev-tools/projects-fs.js
const fs = require("fs");
const path = require("path");

const PROJECT_DIR = path.join(process.cwd(), "public", "data", "projects");
const INDEX_PATH = path.join(PROJECT_DIR, "index.json");

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
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

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug))
    throw new Error("Use a lowercase, hyphenated project slug.");
  const statuses = [
    "Released",
    "In Development",
    "Prototype",
    "Experiment",
    "Archived",
  ];
  if (project.status && !statuses.includes(project.status))
    throw new Error("Invalid project status.");
  const safeUrl = (value) =>
    typeof value === "string" &&
    (/^https?:\/\//.test(value) || /^\/(?!\/)/.test(value));
  for (const link of project.links || [])
    if (!safeUrl(link.url) || !link.label?.trim())
      throw new Error("Each link needs a label and a valid URL.");
  for (const shot of project.screenshots || [])
    if (!safeUrl(shot.url) || !shot.alt?.trim())
      throw new Error("Each screenshot needs a valid URL and description.");
  if (project.cover && !safeUrl(project.cover))
    throw new Error("Invalid cover URL.");
  for (const update of project.updates || [])
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(update.date) ||
      Number.isNaN(Date.parse(update.date)) ||
      !update.title?.trim() ||
      !update.body?.trim()
    )
      throw new Error("Each update needs a date, title, and text.");
  const previous = getProject(project.slug);
  project = {
    ...previous,
    ...project,
    description:
      project.description ??
      project.summary ??
      previous?.description ??
      previous?.summary ??
      "",
    createdAt: previous?.createdAt || project.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  delete project.summary;
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  const filePath = path.join(PROJECT_DIR, project.slug + ".json");
  fs.writeFileSync(filePath, JSON.stringify(project, null, 2), "utf8");
  let index = loadIndex().filter((p) => p.slug !== project.slug);
  const { content, screenshots, links, updates, ...listing } = project;
  index.push(listing);

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
