import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "music.json");
    const raw = await fs.readFile(filePath, "utf8");
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (err) {
    console.error("Load error:", err);
    return NextResponse.json({ error: "Failed to load music.json" }, { status: 500 });
  }
}
