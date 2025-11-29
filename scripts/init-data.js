// scripts/init-data.js
const fs = require("fs");
const path = require("path");

const dataRoot = path.join(process.cwd(), "public", "data");

const structure = {
  blogs: {
    "sample-blog.json": {
      id: "sample-blog",
      title: "Sample Blog",
      slug: "sample-blog",
      category: "General",
      published: "2025-01-01",
      body: "# Hello world",
      order: 0
    }
  },
  projects: {
    "sample-project.json": {
      id: "sample-project",
      title: "Sample Project",
      description: "This is a sample project",
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
      cover: "/cover.jpg",
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
};

// recursively create folders & JSON files
function create(base, obj) {
  for (const name in obj) {
    const target = path.join(base, name);

    if (name.endsWith(".json")) {
      if (!fs.existsSync(target)) {
        fs.writeFileSync(target, JSON.stringify(obj[name], null, 2));
        console.log("Created:", target);
      }
    } else {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
        console.log("Created folder:", target);
      }
      create(target, obj[name]);
    }
  }
}

console.log("\n>>> Initializing /public/data structure...\n");

if (!fs.existsSync(dataRoot)) {
  fs.mkdirSync(dataRoot, { recursive: true });
  console.log("Created folder:", dataRoot);
}

create(dataRoot, structure);

console.log("\n>>> Done! /public/data is ready.\n");
