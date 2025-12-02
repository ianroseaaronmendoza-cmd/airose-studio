// save-json-server.js
// Dev-only server to write JSON files into ./data/
// WARNING: Run this ONLY locally (development). Do NOT deploy this server publicly.

const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

const PORT = process.env.SAVE_JSON_PORT || 4545;

if (process.env.NODE_ENV !== "development") {
  console.error(
    "save-json-server must run in development only. Set NODE_ENV=development to run."
  );
  process.exit(1);
}

function safeJoin(base, file) {
  const resolved = path.resolve(base, file);
  if (!resolved.startsWith(path.resolve(base))) {
    throw new Error("Invalid file path");
  }
  return resolved;
}

// POST /save
// body: { file: "pages/writing/page-3.json", content: {...} }
app.post("/save", async (req, res) => {
  try {
    const { file, content } = req.body;
    if (!file || typeof content === "undefined") {
      return res.status(400).json({ error: "file and content required" });
    }

    const dataDir = path.resolve(__dirname, "data");
    const targetPath = safeJoin(dataDir, file);

    // ensure dir exists
    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });

    const text = JSON.stringify(content, null, 2);
    fs.writeFileSync(targetPath, text, "utf8");

    return res.json({ ok: true, path: targetPath });
  } catch (err) {
    console.error("save error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// GET /load?file=pages/writing/page-3.json
app.get("/load", (req, res) => {
  try {
    const file = req.query.file;
    if (!file) return res.status(400).json({ error: "file required" });

    const dataDir = path.resolve(__dirname, "data");
    const targetPath = safeJoin(dataDir, file);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: "not found" });
    }

    const raw = fs.readFileSync(targetPath, "utf8");
    const parsed = JSON.parse(raw);
    return res.json({ ok: true, content: parsed });
  } catch (err) {
    console.error("load error", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`save-json-server running in dev on http://localhost:${PORT}`);
  console.log("Writes will go to ./data/<file>");
});
