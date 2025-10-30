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

  if (res.status === 404)
    return { json: { poems: [], blogs: [], novels: [] }, sha: null };

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { json: JSON.parse(content), sha: data.sha as string };
}

async function putFileToGitHub(updatedJson: any, sha: string | null) {
  const body = {
    message: `delete from ${FILE_PATH} via Airose Editor`,
    content: Buffer.from(JSON.stringify(updatedJson, null, 2)).toString("base64"),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
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
    if (!type || !slug)
      return NextResponse.json({ error: "Missing type or slug" }, { status: 400 });

    // Always get latest SHA
    let { json: current, sha } = await getFileFromGitHub();

    const list = Array.isArray(current[type]) ? current[type] : [];
    const filtered = list.filter((i: any) => i.slug !== slug);

    current[type] = filtered;

    try {
      await putFileToGitHub(current, sha);
    } catch (err: any) {
      if (err.message.includes("404")) {
        console.log("Retrying delete with fresh SHA...");
        const fresh = await getFileFromGitHub();
        await putFileToGitHub(current, fresh.sha);
      } else {
        throw err;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
