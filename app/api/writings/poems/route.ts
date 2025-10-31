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
export const runtime = "nodejs"; // full node mode for base64 decoding

export async function GET() {
  try {
    if (!TOKEN) {
      console.error("Missing GitHub token for writings");
      return NextResponse.json(
        { poems: [], blogs: [], novels: [] },
        { status: 500 }
      );
    }

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("GitHub fetch failed:", err);
      throw new Error("GitHub content fetch failed");
    }

    const json = await res.json();
    const content = JSON.parse(
      Buffer.from(json.content, "base64").toString("utf8")
    );

    return NextResponse.json(content, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("Poems fetch error:", err);
    return NextResponse.json(
      { poems: [], blogs: [], novels: [] },
      { status: 500 }
    );
  }
}
