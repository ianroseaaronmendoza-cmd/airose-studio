import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const musicPath = path.join(process.cwd(), "data", "music.json");

    if (!fs.existsSync(musicPath)) {
      return NextResponse.json({ albums: [] });
    }

    const data = fs.readFileSync(musicPath, "utf-8");
    const json = JSON.parse(data);

    return NextResponse.json(json);
  } catch (error) {
    console.error("Error loading music data:", error);
    return NextResponse.json({ albums: [] }, { status: 500 });
  }
}
