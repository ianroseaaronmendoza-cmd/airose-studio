// scripts/publish.ts
// Commit files under ./data to GitHub in a single commit.

import fs from "fs";
import path from "path";
import { Octokit } from "octokit";

const OWNER = "your-github-username-or-org";
const REPO = "your-repo-name";
const BRANCH = "main";
const COMMIT_MESSAGE =
  process.env.COMMIT_MESSAGE || "manual: publish content from local editor";

// ---- Types ----
type GitTreeItem = {
  path: string;
  mode: "100644";   // GitHub requires literal mode
  type: "blob";     // GitHub requires literal type
  sha: string;
};

// ---- Utility: Collect files in /data ----
function collectFiles(dir: string, base = dir) {
  const abs = path.resolve(dir);
  const out: { path: string; content: string }[] = [];

  for (const name of fs.readdirSync(abs)) {
    const full = path.join(abs, name);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      out.push(...collectFiles(full, base));
    } else {
      const rel = path.relative(base, full).replace(/\\/g, "/");
      const content = fs.readFileSync(full).toString("base64");
      out.push({ path: rel, content });
    }
  }

  return out;
}

// ---- Main ----
async function run() {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    console.error("GITHUB_PAT environment variable required.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });

  // Collect data files
  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    console.error("No data directory found at", dataDir);
    process.exit(1);
  }

  const files = collectFiles(dataDir, dataDir);

  // Create blobs
  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await octokit.rest.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: file.content,
        encoding: "base64",
      });

      return { ...file, blobSha: blob.data.sha };
    })
  );

  // Get branch’s latest commit
  const ref = await octokit.rest.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  });

  const latestCommitSha = ref.data.object.sha;

  const latestCommit = await octokit.rest.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha,
  });

  const baseTreeSha = latestCommit.data.tree.sha;

  // Build tree items (now with correct literal typing)
  const treeItems: GitTreeItem[] = blobs.map((b) => ({
    path: b.path,
    mode: "100644",
    type: "blob",
    sha: b.blobSha,
  }));

  // Create tree
  const newTree = await octokit.rest.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: treeItems,
  });

  // Create commit
  const newCommit = await octokit.rest.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: COMMIT_MESSAGE,
    tree: newTree.data.sha,
    parents: [latestCommitSha],
  });

  // Move branch pointer to new commit
  await octokit.rest.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.data.sha,
  });

  console.log("Published files to GitHub. Commit:", newCommit.data.sha);
}

run().catch((err: unknown) => {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
  console.error("publish failed:", message);
  process.exit(1);
});
