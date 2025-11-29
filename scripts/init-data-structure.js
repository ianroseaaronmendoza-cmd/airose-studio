// scripts/init-data-structure.js
const fs = require("fs");
const path = require("path");

// Define the folder structure
const structure = {
  data: {
    blogs: {
      "sample-blog.json": {
        id: "sample-blog",
        title: "Sample Blog",
        slug: "sample-blog",
        category: "general",
        published: "2025-01-01",
        body: "# Sample",
        order: 0
      }
    },
    projects: {
      "sample-project.json": {
        id: "sample-project",
        title: "Sample Project",
        description: "Sample description",
        tech: ["react"],
        images: [],
        order: 0
      }
    },
    poems: {
      "sample-poem.json": {
        id: "sample-poem",
        title: "Sample Poem",
        body: "Roses are red...",
        order: 0
      }
    },
    music: {
      "sample-track.json": {
        id: "sample-track",
        title: "Sample Track",
        artist: "Unknown",
        url: "",
        order: 0
      }
    },
    novels: {
      "sample-novel.json": {
        id: "sample-novel",
        title: "Sample Novel",
        cover: "/assets/sample.jpg",
        status: "ongoing",
        chapters: ["ch-001"],
        order: 0
      },
      sample_novel: {
        chapters: {
          "ch-001.json": {
            id: "ch-001",
            number: 1,
            title: "Chapter One",
            body: "This is a sample chapter.",
            published: "2025-01-01"
          }
        }
      }
    }
  }
};

// Helper: create folder + files recursively
function createStructure(basePath, obj) {
  for (const key in obj) {
    const target = path.join(basePath, key);

    // If this is an object containing other objects
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      // If key ends with .json → it's a file
      if (key.endsWith(".json")) {
        if (!fs.existsSync(target)) {
          fs.writeFileSync(target, JSON.stringify(obj[key], null, 2));
          console.log("Created file:", target);
        }
      } else {
        // Otherwise it's a folder
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target, { recursive: true });
          console.log("Created folder:", target);
        }
        createStructure(target, obj[key]);
      }
    }
  }
}

// START
console.log("\n>>> Initializing Airose JSON Data Structure...\n");

const root = process.cwd();
createStructure(root, structure);

console.log("\n>>> Done. Your /data structure is ready!\n");
