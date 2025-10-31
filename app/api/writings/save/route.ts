import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { type, slug, title, content } = await req.json();
    if (type !== "poems") throw new Error("Invalid type");

    const OWNER = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const REPO = process.env.GITHUB_REPO || "airose-studio";
    const BRANCH = process.env.GITHUB_BRANCH || "main";
    const FILE_PATH = process.env.GITHUB_FILE_PATH_WRITING || "data/writings.json";
    const TOKEN =
      process.env.GITHUB_PAT_WRITING ||
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL_WRITING;

    if (!TOKEN) throw new Error("Missing GitHub token");

    // Fetch existing file
    const baseUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(`${baseUrl}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!getRes.ok) throw new Error(`Failed to fetch current writings.json`);
    const fileJson = await getRes.json();
    const sha = fileJson.sha;
    const current = JSON.parse(
      Buffer.from(fileJson.content, "base64").toString("utf8")
    );

    // Update or add poem
    const poems = current.poems || [];
    const safeSlug =
      slug?.trim() ||
      title
        ?.toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const updated = poems.filter((p: any) => p.slug !== safeSlug);
    updated.push({ slug: safeSlug, title, content });

    const newData = { ...current, poems: updated };
    const b64 = Buffer.from(JSON.stringify(newData, null, 2)).toString("base64");

    const putRes = await fetch(baseUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Update poem: ${title}`,
        content: b64,
        sha,
        branch: BRANCH,
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      throw new Error(`GitHub PUT failed: ${err}`);
    }

    // Optionally trigger a Vercel redeploy
    if (DEPLOY_HOOK) fetch(DEPLOY_HOOK).catch(() => null);

    return NextResponse.json({ ok: true, slug: safeSlug });
  } catch (err: any) {
    console.error("Save poem error:", err);
    return NextResponse.json({ error: err.message || "Save failed" }, { status: 500 });
  }
}
