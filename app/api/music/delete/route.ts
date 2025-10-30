import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = "data/music.json";

    if (!token || !owner || !repo) throw new Error("Missing GitHub credentials");

    // 1️⃣ Fetch file to get SHA
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });

    if (!getRes.ok) {
      if (getRes.status === 404) {
        return NextResponse.json({ message: "File not found, nothing to delete." });
      }
      throw new Error(`Failed to fetch existing file: ${getRes.status}`);
    }

    const getJson = await getRes.json();
    const sha = getJson.sha;

    // 2️⃣ Delete file from GitHub
    const delRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Delete music.json (${new Date().toISOString()})`,
        sha,
        branch,
      }),
    });

    if (!delRes.ok) {
      const errText = await delRes.text();
      console.error("GitHub delete failed:", errText);
      throw new Error("GitHub delete failed");
    }

    return NextResponse.json({ success: true, message: "music.json deleted from GitHub" });
  } catch (err: any) {
    console.error("Music delete error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete music" }, { status: 500 });
  }
}
