// @ts-nocheck
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "writings.json");

// --- GET ---
// Returns the current contents of writings.json
export async function GET() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(data);
    return NextResponse.json(json);
  } catch (err) {
    console.error("Error reading writings.json:", err);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

// --- POST ---
// Rewrites the file with updated content (used for saving edits)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ TEMP FILE PROTECTION: prevents corrupted writes
    const tempPath = filePath + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(body, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);

    console.log("✅ writings.json updated successfully");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error writing writings.json:", err);
    return NextResponse.json({ error: "Failed to write file" }, { status: 500 });
  }
}
