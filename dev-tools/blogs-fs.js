const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(process.cwd(), "public", "data", "blogs");
const INDEX_PATH = path.join(BLOG_DIR, "index.json");

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
}

function loadIndex() {
  if (!fs.existsSync(INDEX_PATH)) return [];
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
}

function saveIndex(list) {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(list, null, 2), "utf8");
}

function getAllBlogs() {
  return loadIndex();
}

function getBlog(slug) {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveBlog(blog) {
  ensureDev();

  const slug = blog.slug;
  const blogPath = path.join(BLOG_DIR, `${slug}.json`);

  // Ensure folder
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  // Write the main blog JSON
  fs.writeFileSync(blogPath, JSON.stringify(blog, null, 2));

  // Update index.json
  let index = loadIndex();
  const existing = index.find((b) => b.slug === slug);

  if (existing) {
    Object.assign(existing, blog);
  } else {
    index.push(blog);
  }

  // Sort by date, newest first
  index.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  saveIndex(index);
  return blog;
}

function deleteBlog(slug) {
  ensureDev();
  
  const blogPath = path.join(BLOG_DIR, `${slug}.json`);
  if (fs.existsSync(blogPath)) {
    fs.unlinkSync(blogPath);
  }

  let index = loadIndex();
  index = index.filter((b) => b.slug !== slug);
  saveIndex(index);
  
  return true;
}

module.exports = {
  getAllBlogs,
  getBlog,
  saveBlog,
  deleteBlog,
};