import { NextResponse } from "next/server";
import slugify from "slugify";

const OWNER = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
const REPO = process.env.GITHUB_REPO || "airose-studio";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_FILE_PATH_WRITING || "data/writings.json";
const TOKEN =
  process.env.GITHUB_PAT_WRITING ||
  process.env.GITHUB_TOKEN ||
  process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!TOKEN) throw new Error("Missing GitHub token");

export const runtime = "edge";
export const dynamic = "force-dynamic";

// --- Helper: fetch the current file from GitHub
async function fetchCurrentFile() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch current writings.json: ${res.status}`);
  }

  const data = await res.json();
  const content = JSON.parse(
    Buffer.from(data.content, "base64").toString("utf8")
  );

  return { content, sha: data.sha };
}

// --- Helper: push new JSON to GitHub
async function pushJson(newContent: any, sha: string) {
  const body = {
    message: `Update writings.json [auto-sync]`,
    content: Buffer.from(JSON.stringify(newContent, null, 2)).toString("base64"),
    branch: BRANCH,
    sha,
  };

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`GitHub PUT failed: ${msg}`);
  }

  return res.json();
}

export async function POST(req: Request) {
  try {
    const { type, slug, title, content } = await req.json();

    if (type !== "poems") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    // Step 1: fetch latest file + sha
    let { content: data, sha } = await fetchCurrentFile();

    // Step 2: create data structure if empty
    data.poems ||= [];

    // Step 3: find if existing poem
    const existing = data.poems.find((p: any) => p.slug === slug);

    if (existing) {
      existing.title = title;
      existing.content = content;
      existing.date = new Date().toISOString();
    } else {
      // Step 4: create new poem with auto-slug
      const newSlug =
        slugify(title, { lower: true, strict: true }) +
        "-" +
        Date.now().toString(36);

      data.poems.push({
        slug: newSlug,
        title,
        content,
        date: new Date().toISOString(),
      });
    }

    // Step 5: push update to GitHub
    try {
      const result = await pushJson(data, sha);
      return NextResponse.json({ success: true, commit: result.commit });
    } catch (err: any) {
      // Retry once if conflict (409)
      if (err.message.includes("409")) {
        console.warn("Conflict detected — refetching and retrying save...");
        const refreshed = await fetchCurrentFile();
        const retry = await pushJson(data, refreshed.sha);
        return NextResponse.json({ success: true, commit: retry.commit });
      }
      throw err;
    }
  } catch (err: any) {
    console.error("❌ Save poem error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save poem" },
      { status: 500 }
    );
  }
}
