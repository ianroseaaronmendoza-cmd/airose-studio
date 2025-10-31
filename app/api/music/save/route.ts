// app/api/music/save/route.ts
import { NextResponse } from "next/server";

/**
 * Saves the full music.json to GitHub.
 * Works even if the file doesn't exist yet.
 * Requires these env vars:
 *   GITHUB_TOKEN or GITHUB_PAT
 *   GITHUB_OWNER
 *   GITHUB_REPO
 *   GITHUB_BRANCH
 *   GITHUB_FILE_PATH_MUSIC
 */
export async function POST(req: Request) {
  try {
    const { albums } = await req.json();
    if (!albums || !Array.isArray(albums)) {
      return NextResponse.json({ error: "Missing or invalid albums array" }, { status: 400 });
    }

    // --- Environment ---
    const token =
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PAT ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const owner = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const repo = process.env.GITHUB_REPO || "airose-studio";
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = process.env.GITHUB_FILE_PATH_MUSIC || "data/music.json";

    if (!token) throw new Error("Missing GitHub token");
    if (!owner || !repo) throw new Error("Missing repo configuration");

    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    console.log("🎵 GITHUB CONFIG", { owner, repo, branch, path });

    // --- Step 1: Get current SHA (if exists) ---
    let sha: string | null = null;
    let getRes = await fetch(`${apiBase}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (getRes.status === 200) {
      const getJson = await getRes.json();
      sha = getJson.sha;
      console.log("Existing file SHA:", sha);
    } else if (getRes.status === 404) {
      console.warn("No existing music.json found — creating new file");
    } else {
      const errText = await getRes.text();
      console.error("GitHub GET failed:", getRes.status, errText);
      return NextResponse.json(
        { error: `GitHub GET failed: ${getRes.status}` },
        { status: 500 }
      );
    }

    // --- Step 2: Prepare commit content ---
    const newContent = JSON.stringify({ albums }, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    // --- Step 3: Commit to GitHub ---
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Update music.json (${new Date().toISOString()})`,
        content: b64,
        sha: sha ?? undefined,
        branch,
      }),
    });

    const putText = await putRes.text();

    if (!putRes.ok) {
      console.error("GitHub PUT failed:", putRes.status, putText);
      return NextResponse.json(
        { error: `GitHub PUT failed: ${putRes.status}` },
        { status: 500 }
      );
    }

    const putJson = JSON.parse(putText);
    console.log("✅ Commit success:", putJson.commit?.html_url);

    return NextResponse.json({
      success: true,
      commit: putJson.commit,
      html_url: putJson.commit?.html_url,
    });
  } catch (err: any) {
    console.error("Music save error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
