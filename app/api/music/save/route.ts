import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.albums) throw new Error("Missing albums array");

    const filePath = path.join(process.cwd(), "data", "music.json");
    await fs.writeFile(filePath, JSON.stringify({ albums: body.albums }, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Failed to save music.json" }, { status: 500 });
  }
}
