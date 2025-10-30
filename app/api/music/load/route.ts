import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = "data/music.json";

    if (!token || !owner || !repo) throw new Error("Missing GitHub credentials");

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ albums: [] }); // empty default
      }
      throw new Error(`GitHub fetch failed: ${res.status}`);
    }

    const json = await res.json();
    const decoded = Buffer.from(json.content, "base64").toString();
    const parsed = JSON.parse(decoded);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Music load error:", err);
    return NextResponse.json({ error: err.message || "Failed to load music" }, { status: 500 });
  }
}
