import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { albumId, fromIndex, toIndex } = await req.json();
    const token = process.env.GITHUB_PAT;
    const repo = "ianroseaaronmendoza-cmd/airose-studio";
    const path = "data/music.json";

    if (!token) return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("Fetch current failed:", txt);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const json = await res.json();
    const current = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
    const albums = current.albums || [];
    const target = albums.find((a: any) => a.id === albumId);
    if (!target) return NextResponse.json({ error: "Album not found" }, { status: 404 });

    const songs = [...(target.songs || [])];
    const [moved] = songs.splice(fromIndex, 1);
    songs.splice(toIndex, 0, moved);
    target.songs = songs;

    const newData = JSON.stringify({ albums }, null, 2);
    const encoded = Buffer.from(newData).toString("base64");

    const update = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Reorder songs in album ${albumId}`,
        content: encoded,
        sha: json.sha,
      }),
    });

    if (!update.ok) {
      const err = await update.text();
      console.error("GitHub update failed:", err);
      return NextResponse.json({ error: "GitHub update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Music reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder songs" }, { status: 500 });
  }
}
