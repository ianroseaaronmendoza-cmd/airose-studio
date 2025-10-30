import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { albumId, songId } = await req.json();
    const filePath = path.join(process.cwd(), "data", "music.json");
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
    let albums = data.albums || [];

    if (albumId && songId) {
      albums = albums.map((a: any) =>
        a.id === albumId ? { ...a, songs: (a.songs || []).filter((s: any) => s.id !== songId) } : a
      );
    } else if (albumId) {
      albums = albums.filter((a: any) => a.id !== albumId);
    }

    await fs.writeFile(filePath, JSON.stringify({ albums }, null, 2), "utf8");
    return NextResponse.json({ success: true, albums });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
