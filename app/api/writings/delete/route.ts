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
    const { type, slug } = await req.json();
    if (!type || !slug) throw new Error("Missing type or slug");
    if (!TOKEN) throw new Error("Missing GitHub token");

    const getUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });
    const getJson = await getRes.json();
    const content = JSON.parse(
      Buffer.from(getJson.content, "base64").toString("utf8")
    );

    const arr = Array.isArray(content[type]) ? content[type] : [];
    const filtered = arr.filter((p: any) => p.slug !== slug);
    content[type] = filtered;

    const newContent = JSON.stringify(content, null, 2);
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
          message: `Delete ${type}/${slug} (${new Date().toISOString()})`,
          content: b64,
          sha: getJson.sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putRes.ok) throw new Error(await putRes.text());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete poem" },
      { status: 500 }
    );
  }
}
