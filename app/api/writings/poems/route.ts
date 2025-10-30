import { NextResponse } from "next/server";

const OWNER = "ianroseaaaronmendoza-cmd";
const REPO = "airose-studio";
const BRANCH = "main";
const FILE_PATH = "data/writings.json";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { poems: [], blogs: [], novels: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
    const json = await res.json();
    return NextResponse.json(json, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { poems: [], blogs: [], novels: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}