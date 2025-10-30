import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const musicPath = path.join(process.cwd(), "data", "music.json");

export async function POST(req: Request) {
  try {
    const { albumId, reorderedSongs } = await req.json();

    if (!albumId || !Array.isArray(reorderedSongs)) {
      return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
    }

    if (!fs.existsSync(musicPath)) {
      return NextResponse.json({ success: false, message: "No music data found." });
    }

    const data = JSON.parse(fs.readFileSync(musicPath, "utf-8"));
    const albums = data.albums.map((album: any) =>
      album.id === albumId ? { ...album, songs: reorderedSongs } : album
    );

    fs.writeFileSync(musicPath, JSON.stringify({ albums }, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "Reorder successful." });
  } catch (error) {
    console.error("Error reordering songs:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
