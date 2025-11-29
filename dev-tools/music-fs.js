// dev-tools/music-fs.js
const fs = require("fs");
const path = require("path");

const MUSIC_PATH = path.join(process.cwd(), "public", "data", "music.json");

function ensureDev() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Editing music is allowed only in development mode.");
  }
}

function loadMusic() {
  try {
    if (!fs.existsSync(MUSIC_PATH)) return { albums: [] };
    const raw = fs.readFileSync(MUSIC_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read music.json:", err);
    return { albums: [] };
  }
}

function saveMusic(payload) {
  ensureDev();
  const content = { albums: payload.albums || [] };
  fs.mkdirSync(path.dirname(MUSIC_PATH), { recursive: true });
  fs.writeFileSync(MUSIC_PATH, JSON.stringify(content, null, 2), "utf8");
  return content;
}

module.exports = {
  loadMusic,
  saveMusic,
};
