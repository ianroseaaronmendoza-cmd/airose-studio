import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const OWNER = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const REPO = process.env.GITHUB_REPO || "airose-studio";
    const BRANCH = process.env.GITHUB_BRANCH || "main";
    const FILE_PATH = process.env.GITHUB_FILE_PATH_WRITING || "data/writings.json";

    const res = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error(`Failed to fetch writings.json: ${res.status}`);
      return NextResponse.json({ poems: [], blogs: [], novels: [] });
    }

    const json = await res.json();
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Error loading writings.json:", err);
    return NextResponse.json({ poems: [], blogs: [], novels: [] });
  }
}
