import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { albums } = body;

    if (!albums || !Array.isArray(albums)) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    const musicPath = path.join(process.cwd(), "data", "music.json");
    fs.writeFileSync(musicPath, JSON.stringify({ albums }, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "Music data saved successfully." });
  } catch (error) {
    console.error("Error saving music data:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
