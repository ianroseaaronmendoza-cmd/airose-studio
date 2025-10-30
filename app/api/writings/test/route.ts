// app/api/writings/test/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "writings-store.json");

/**
 * GET /api/writings/test
 * âœ… Confirms that the server can read and write the persistent JSON store.
 * Returns diagnostic info such as file size and timestamp.
 */
export async function GET() {
  try {
    // 1ï¸âƒ£ Ensure file exists
    await fs.access(DATA_PATH).catch(async () => {
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, JSON.stringify({ poems: [], novels: [], blogs: [] }, null, 2));
    });

    // 2ï¸âƒ£ Read current contents
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const data = JSON.parse(raw || "{}");

    // 3ï¸âƒ£ Write a timestamp heartbeat (no data loss)
    data.__lastTest = new Date().toISOString();
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));

    // 4ï¸âƒ£ Return diagnostic info
    const stats = await fs.stat(DATA_PATH);
    return NextResponse.json({
      ok: true,
      message: "Persistence check passed âœ…",
      file: DATA_PATH,
      size_bytes: stats.size,
      modified: stats.mtime,
      sample_data_keys: Object.keys(data),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Persistence check failed âŒ",
        error: String(err.message || err),
      },
      { status: 500 }
    );
  }
}

