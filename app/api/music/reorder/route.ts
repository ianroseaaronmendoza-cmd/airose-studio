import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { albums } = await req.json();
    if (!albums) throw new Error("Missing albums");

    const filePath = path.join(process.cwd(), "data", "music.json");
    await fs.writeFile(filePath, JSON.stringify({ albums }, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
