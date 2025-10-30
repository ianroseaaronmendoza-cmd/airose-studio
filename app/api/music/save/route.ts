import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { albums } = await req.json();
    if (!albums) throw new Error("Missing albums array");

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) throw new Error("Missing GitHub credentials");

    const path = "data/music.json";

    // 1️⃣ Get current file SHA (needed to update existing file)
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    const getJson = await getRes.json();
    const sha = getJson.sha || null;

    // 2️⃣ Create commit payload
    const newContent = JSON.stringify({ albums }, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    // 3️⃣ PUT to GitHub (commit)
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Update music.json (${new Date().toISOString()})`,
        content: b64,
        sha,
        branch,
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("GitHub commit failed:", errText);
      throw new Error("GitHub commit failed");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Music save error:", err);
    return NextResponse.json({ error: err.message || "Failed to save music" }, { status: 500 });
  }
}
