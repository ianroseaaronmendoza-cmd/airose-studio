import { NextRequest, NextResponse } from "next/server";

const OWNER = "ianroseaaronmendoza-cmd";
const REPO = "airose-studio";
const BRANCH = "main";
const FILE_PATH = "data/writings.json";

async function getFileFromGitHub() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "Cache-Control": "no-cache",
      },
    }
  );

  if (res.status === 404) {
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

async function putFileToGitHub(updatedJson: any, previousSha: string | null) {
  const body = {
    message: `Delete poem from ${FILE_PATH} via Airose Studio`,
    content: Buffer.from(JSON.stringify(updatedJson, null, 2)).toString("base64"),
    branch: BRANCH,
    ...(previousSha ? { sha: previousSha } : {}),
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

export async function POST(req: NextRequest) {
  try {
    const { type, slug } = await req.json();

    if (!type || !slug) {
      return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });
    }

    // 1️⃣ Always get the latest file and SHA
    let { json: current, sha } = await getFileFromGitHub();

    if (!current[type]) current[type] = [];

    // 2️⃣ Filter out the deleted poem
    const before = current[type].length;
    current[type] = current[type].filter((item: any) => item.slug !== slug);

    // If no change, stop early
    if (current[type].length === before) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    // 3️⃣ Attempt to write to GitHub
    try {
      await putFileToGitHub(current, sha);
    } catch (err: any) {
      // Retry once if SHA went stale
      if (err.message.includes("404")) {
        const fresh = await getFileFromGitHub();
        await putFileToGitHub(current, fresh.sha);
      } else {
        throw err;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message || "Delete failed" }, { status: 500 });
  }
}
