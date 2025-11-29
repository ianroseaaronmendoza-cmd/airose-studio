const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(process.cwd(), "public", "data", "blogs");
const INDEX_PATH = path.join(BLOG_DIR, "index.json");

function ensureDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Editing blogs is allowed only in development mode.");
  }
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

  const exists = index.find((item) => item.slug === slug);

  if (exists) {
    // Update existing item
    exists.title = blog.title;
    exists.coverImage = blog.coverImage || "";
    exists.createdAt = blog.createdAt || exists.createdAt || Date.now();
  } else {
    // Add new item
    index.push({
      slug: slug,
      title: blog.title,
      coverImage: blog.coverImage || "",
      createdAt: blog.createdAt || Date.now(),
    });
  }

  saveIndex(index);

  return blog;
}

function deleteBlog(slug) {
  ensureDev();

  const blogPath = path.join(BLOG_DIR, `${slug}.json`);
  if (fs.existsSync(blogPath)) fs.unlinkSync(blogPath);

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
