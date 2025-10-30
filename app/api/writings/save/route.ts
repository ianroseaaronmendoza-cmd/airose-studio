import { NextRequest, NextResponse } from "next/server";

const OWNER = "ianroseaaaronmendoza-cmd"; // your GitHub username/org
const REPO = "airose-studio";             // repo name
const BRANCH = "main";                    // branch to commit to
const FILE_PATH = "data/writings.json";  // file path in repo

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fetch file content and SHA from GitHub
async function getFileFromGitHub() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );

  if (res.status === 404) {
    // File doesn't exist yet
    return { json: { poems: [], blogs: [], novels: [] }, sha: null };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  const json = JSON.parse(content);
  return { json, sha: data.sha as string };
}

// Commit updated file to GitHub
async function putFileToGitHub(updatedJson: any, previousSha: string | null) {
  const message = `chore(content): update ${FILE_PATH} via editor`;
  const body = {
    message,
    content: Buffer.from(JSON.stringify(updatedJson, null, 2)).toString("base64"),
    branch: BRANCH,
    ...(previousSha ? { sha: previousSha } : {}), // omit sha if creating new file
  };

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub write failed: ${res.status} ${text}`);
  }

  return res.json();
}

// Trigger Vercel deploy hook
async function triggerDeploy() {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return;
  await fetch(url, { method: "POST" });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GITHUB_PAT) {
      return NextResponse.json({ error: "GITHUB_PAT not configured" }, { status: 501 });
    }

    const body = await req.json();
    const { type, slug, title, content } = body as {
      type: "poems" | "blogs" | "novels";
      slug: string;
      title?: string;
      content?: string;
    };

    if (!type || !slug) {
      return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });
    }

    // 1) Load current JSON from GitHub
    const { json: current, sha } = await getFileFromGitHub();

    // 2) Update or add item
    const list = (current as any)[type] as Array<any> | undefined;
    const arr = Array.isArray(list) ? list : [];
    const idx = arr.findIndex((i) => i.slug === slug);

    if (idx === -1) {
      (current as any)[type] = [{ slug, title: title ?? "Untitled", content: content ?? "" }, ...arr];
    } else {
      arr[idx] = {
        ...arr[idx],
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
      };
      (current as any)[type] = arr;
    }

    // 3) Commit updated file to GitHub
    await putFileToGitHub(current, sha);

    // 4) Trigger Vercel deploy
    await triggerDeploy();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Save error:", err);
    return NextResponse.json({ error: err.message ?? "Save failed" }, { status: 500 });
  }
}