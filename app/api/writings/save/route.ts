import { NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
const REPO = process.env.GITHUB_REPO || "airose-studio";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN =
  process.env.GITHUB_PAT_WRITING ||
  process.env.GITHUB_TOKEN_WRITING ||
  process.env.GITHUB_PAT ||
  process.env.GITHUB_TOKEN;

const FILE_PATH = "data/writings.json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { type, slug, title, content } = await req.json();
    if (!type || !slug) throw new Error("Missing required fields");

    if (!TOKEN) throw new Error("Missing GitHub token");

    // Fetch current file via GitHub API
    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });
    const getJson = await getRes.json();

    const currentContent = JSON.parse(
      Buffer.from(getJson.content, "base64").toString("utf8")
    );

    // Modify data
    const updated = { ...currentContent };
    const arr = Array.isArray(updated[type]) ? updated[type] : [];
    const idx = arr.findIndex((p: any) => p.slug === slug);

    const newPoem = { slug, title, content, updated: new Date().toISOString() };
    if (idx >= 0) arr[idx] = newPoem;
    else arr.push(newPoem);

    updated[type] = arr;

    // Commit back to GitHub
    const newContent = JSON.stringify(updated, null, 2);
    const b64 = Buffer.from(newContent).toString("base64");

    const putRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Update ${type}/${slug} (${new Date().toISOString()})`,
          content: b64,
          sha: getJson.sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("GitHub PUT failed:", errText);
      throw new Error("GitHub commit failed");
    }

    const putJson = await putRes.json();
    return NextResponse.json({
      success: true,
      commitUrl: putJson.commit?.html_url,
    });
  } catch (err: any) {
    console.error("Save error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save" },
      { status: 500 }
    );
  }
}
