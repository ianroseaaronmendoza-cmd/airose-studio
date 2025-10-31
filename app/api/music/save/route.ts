import { NextResponse } from "next/server";

/**
 * Airose Studio — Music Save Route
 * 
 * This route commits the latest albums (from editor mode)
 * into your GitHub repo at /data/music.json.
 *
 * It uses the following environment variables (set in Vercel):
 * 
 *  GITHUB_OWNER             → Repo owner (e.g., ianroseaaronmendoza-cmd)
 *  GITHUB_REPO              → Repo name (e.g., airose-studio)
 *  GITHUB_BRANCH            → Branch name (e.g., main)
 *  GITHUB_PAT               → Your GitHub Personal Access Token
 *  GITHUB_FILE_PATH_MUSIC   → Target file path (e.g., data/music.json)
 * 
 * If any of these are missing, it will throw descriptive errors.
 */

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse request body
    const { albums } = await req.json();
    if (!albums) throw new Error("Missing albums array");

    // 2️⃣ Load GitHub credentials from environment variables
    const token =
      process.env.GITHUB_PAT ||
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const repo = process.env.GITHUB_REPO || "airose-studio";
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = process.env.GITHUB_FILE_PATH_MUSIC || "data/music.json";

    // 3️⃣ Safety check — log what’s actually being used
    console.log("🧩 GITHUB CONFIG:");
    console.log({
      owner,
      repo,
      branch,
      path,
      tokenExists: !!token,
    });

    if (!token) throw new Error("Missing GitHub token (GITHUB_PAT)");
    if (!owner || !repo) throw new Error("Missing GitHub owner or repo");

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 4️⃣ Fetch the current SHA for the file (needed for update)
    console.log("📡 Fetching current SHA:", `${apiBase}?ref=${branch}`);
    const getRes = await fetch(`${apiBase}?ref=${branch}`, {
      headers: {
        Authorization: `token ${token}`, // ✅ Use 'token' instead of 'Bearer'
        Accept: "application/vnd.github+json",
      },
    });

    if (!getRes.ok) {
      const errText = await getRes.text();
      console.error("❌ Failed to get current SHA:", getRes.status, errText);
      throw new Error(`GitHub GET failed: ${getRes.status}`);
    }

    const getJson = await getRes.json();
    const sha = getJson.sha;
    console.log("✅ Current SHA:", sha);

    // 5️⃣ Prepare commit payload
    const newContent = JSON.stringify({ albums }, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    // 6️⃣ Send PUT request to update file
    console.log("📝 Committing update to GitHub...");
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`, // ✅ still 'token'
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
      console.error("❌ GitHub commit failed:", errText);
      throw new Error(`GitHub PUT failed: ${putRes.status}`);
    }

    const putJson = await putRes.json();
    console.log("✅ Commit success:", putJson.commit?.html_url);

    // 7️⃣ Return success to frontend
    return NextResponse.json({
      success: true,
      commitUrl: putJson.commit?.html_url,
    });
  } catch (err: any) {
    console.error("💥 Music save error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save music" },
      { status: 500 }
    );
  }
}
