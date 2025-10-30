import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const musicPath = path.join(process.cwd(), "data", "music.json");

export async function POST(req: Request) {
  try {
    const { albumId, songId } = await req.json();

    if (!fs.existsSync(musicPath)) {
      return NextResponse.json({ success: false, message: "No music file found." });
    }

    const data = JSON.parse(fs.readFileSync(musicPath, "utf-8"));
    let albums = data.albums || [];

    if (albumId && songId) {
      // delete song
      albums = albums.map((a: any) =>
        a.id === albumId
          ? { ...a, songs: a.songs.filter((s: any) => s.id !== songId) }
          : a
      );
    } else if (albumId) {
      // delete album
      albums = albums.filter((a: any) => a.id !== albumId);
    } else {
      return NextResponse.json({ success: false, message: "Invalid parameters." });
    }

    fs.writeFileSync(musicPath, JSON.stringify({ albums }, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting music data:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
