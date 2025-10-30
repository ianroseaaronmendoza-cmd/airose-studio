import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.data; // expects { albums: [...] }
    const token = process.env.GITHUB_PAT;
    const repo = "ianroseaaronmendoza-cmd/airose-studio";
    const path = "data/music.json";

    if (!token) {
      console.error("GITHUB_PAT not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // fetch current file to obtain sha
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to fetch current music.json:", res.status, text);
      return NextResponse.json({ error: "Failed to fetch remote file" }, { status: 500 });
    }

    const json = await res.json();
    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    const update = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update music data via Airose Studio`,
        content: newContent,
        sha: json.sha,
      }),
    });

    if (!update.ok) {
      const errText = await update.text();
      console.error("GitHub update failed:", errText);
      return NextResponse.json({ error: "GitHub update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Music save error:", err);
    return NextResponse.json({ error: "Failed to save music data" }, { status: 500 });
  }
}
