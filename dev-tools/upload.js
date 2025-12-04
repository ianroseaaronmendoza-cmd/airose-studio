// dev-tools/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const section = req.body.section || "novels";
    const uploadsDir = path.join(__dirname, `../public/uploads/${section}`);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    
    // ✅ Get extension from originalname OR mimetype
    let ext = path.extname(file.originalname);
    
    // ✅ If no extension (blob), get it from mimetype
    if (!ext || ext === '.blob') {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/x-icon': '.ico',
        'image/vnd.microsoft.icon': '.ico',
      };
      ext = mimeToExt[file.mimetype] || '.webp'; // Default to .webp
      console.log(`   No extension found, using: ${ext} (from ${file.mimetype})`);
    }
    
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    
    // Sanitize filename
    const sanitizedName = baseName && baseName !== 'blob'
      ? baseName
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-_]/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase()
      : 'image'; // Default name if blob
    
    const filename = `${timestamp}-${sanitizedName}${ext}`;
    console.log("   Generated:", filename);
    
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      "image/x-icon",
      "image/vnd.microsoft.icon"
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

async function handleUpload(req, res) {
  console.log("\n🚀 Upload request received");
  console.log("   Method:", req.method);
  console.log("   Content-Type:", req.headers['content-type']);
  
  const uploadMiddleware = upload.single("file");

  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const section = req.body.section || "novels";
    const url = `/uploads/${section}/${req.file.filename}`;
    
    console.log(`✅ File uploaded successfully!`);
    console.log(`   URL: ${url}`);
    console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`   Path: ${req.file.path}\n`);
    
    res.json({ ok: true, url });
  });
}

module.exports = { handleUpload };
