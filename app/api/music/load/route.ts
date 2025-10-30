import { NextResponse } from "next/server";

export async function GET() {
  try {
    const repo = "ianroseaaronmendoza-cmd/airose-studio";
    const path = "data/music.json";

    const res = await fetch(`https://raw.githubusercontent.com/${repo}/main/${path}`, { cache: "no-store" });

    if (!res.ok) {
      console.warn("Music load fetch failed:", res.status);
      // If remote missing, return empty base
      return NextResponse.json({ albums: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Music load error:", err);
    return NextResponse.json({ albums: [] }, { status: 500 });
  }
}
