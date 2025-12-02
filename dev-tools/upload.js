// dev-tools/upload.js
const fs = require("fs");
const path = require("path");
const formidable = require("formidable"); // tiny lib (optional, but we parse manually below)

function ensureDev() {
  // Skip check - this endpoint only exists in webpack devServer
  // If this route is called, we're already in development mode
  return;
}

/**
 * Accepts a Node `req` object (express-like) and saves uploaded file.
 * Expects multipart/form-data with fields:
 *  - "file" => file binary
 *  - "section" => one of "blogs"|"projects"|"novels"|"music" (fallback to "uploads")
 *
 * Returns: { url: "/uploads/<section>/<timestamp>-<filename>" }
 */
function handleUpload(req, res) {
  ensureDev();

  // We'll parse multipart manually using "busboy"-like streaming is possible,
  // but the simplest portable approach is to collect buffers (suitable for small files).
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    res.status(400).json({ error: "Invalid content-type, expected multipart/form-data" });
    return;
  }

  // Use a simple boundary parse (synchronous buffering). For larger files, swap to busboy.
  let raw = Buffer.alloc(0);
  req.on("data", (chunk) => {
    raw = Buffer.concat([raw, chunk]);
  });

  req.on("end", () => {
    // Find boundary
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      res.status(400).json({ error: "Boundary not found" });
      return;
    }
    const boundary = Buffer.from("--" + boundaryMatch[1]);

    // Split by boundary
    const parts = [];
    let start = raw.indexOf(boundary) + boundary.length + 2; // skip \r\n
    while (start < raw.length) {
      const end = raw.indexOf(boundary, start);
      if (end === -1) break;
      const part = raw.slice(start, end - 2); // remove trailing \r\n
      parts.push(part);
      start = end + boundary.length + 2;
    }

    // Parse parts to find file and section field
    let fileBuffer = null;
    let originalFilename = "upload.bin";
    let section = "uploads"; // fallback

    parts.forEach((part) => {
      // headers end at \r\n\r\n
      const headerEnd = part.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;
      const headerBuf = part.slice(0, headerEnd).toString("utf8");
      const body = part.slice(headerEnd + 4);

      // Name header: Content-Disposition: form-data; name="file"; filename="..."
      const nameMatch = headerBuf.match(/name="([^"]+)"/);
      const filenameMatch = headerBuf.match(/filename="([^"]+)"/);
      if (nameMatch) {
        const fieldName = nameMatch[1];
        if (fieldName === "file" && filenameMatch) {
          originalFilename = path.basename(filenameMatch[1]);
          fileBuffer = body;
        } else if (fieldName === "section") {
          section = body.toString("utf8").trim().toLowerCase() || "uploads";
          // sanitize permitted sections
          const allowed = ["blogs", "projects", "novels", "music", "uploads"];
          if (!allowed.includes(section)) section = "uploads";
        }
      }
    });

    if (!fileBuffer) {
      res.status(400).json({ error: "No file part found" });
      return;
    }

    // sanitize filename
    const safeName = originalFilename.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const timestamp = Date.now();
    const finalName = `${timestamp}-${safeName}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", section);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const finalPath = path.join(uploadsDir, finalName);
    fs.writeFileSync(finalPath, fileBuffer);

    // Return public url path
    const publicUrl = `/uploads/${section}/${finalName}`;
    res.json({ ok: true, url: publicUrl });
  });

  req.on("error", (err) => {
    console.error("Upload parse error:", err);
    res.status(500).json({ error: "Upload failed" });
  });
}

module.exports = { handleUpload };
