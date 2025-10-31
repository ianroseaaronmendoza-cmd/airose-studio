import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { albums } = await req.json();
    if (!albums) throw new Error("Missing albums array");

    // GitHub credentials (must match your Vercel env vars)
    const token =
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PAT ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const repo = process.env.GITHUB_REPO || "airose-studio";
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) {
      console.error("Missing GitHub credentials", { token, owner, repo });
      throw new Error("Missing GitHub credentials");
    }

    const path = process.env.GITHUB_FILE_PATH_MUSIC || "data/music.json";
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1️⃣ Get current SHA (required for updating)
    const getRes = await fetch(`${apiBase}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!getRes.ok) {
      const errText = await getRes.text();
      console.error("Failed to get current SHA:", getRes.status, errText);
      throw new Error(`GitHub GET failed: ${getRes.status}`);
    }

    const getJson = await getRes.json();
    const sha = getJson.sha;

    // 2️⃣ Prepare commit payload
    const newContent = JSON.stringify({ albums }, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    // 3️⃣ PUT commit to GitHub
    const putRes = await fetch(apiBase, {
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
      throw new Error(`GitHub PUT failed: ${putRes.status}`);
    }

    const putJson = await putRes.json();
    console.log("✅ Commit success:", putJson.commit?.html_url);

    return NextResponse.json({ success: true, commit: putJson.commit });
  } catch (err: any) {
    console.error("Music save error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save music" },
      { status: 500 }
    );
  }
}
