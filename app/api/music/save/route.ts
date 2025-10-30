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

    // Step 1: Try to fetch existing file to get SHA
    let sha: string | null = null;
    const getRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
    );

    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha || null;
    } else {
      console.log("No existing music.json found — will create new file");
    }

    // Step 2: Prepare commit payload
    const newContent = JSON.stringify({ albums }, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    // Step 3: Commit to GitHub
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Save music.json (${new Date().toISOString()})`,
        content: b64,
        branch,
        ...(sha ? { sha } : {}), // include sha only if updating
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
