import { NextResponse } from "next/server";

// Force dynamic execution (no caching)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { type, slug, title, content } = await req.json();

    if (type !== "poems") throw new Error("Invalid type");

    // 🔧 --- ENVIRONMENT VARIABLES ---
    const OWNER = process.env.GITHUB_OWNER || "ianroseaaronmendoza-cmd";
    const REPO = process.env.GITHUB_REPO || "airose-studio";
    const BRANCH = process.env.GITHUB_BRANCH || "main";
    const FILE_PATH =
      process.env.GITHUB_FILE_PATH_WRITING || "data/writings.json";
    const TOKEN =
      process.env.GITHUB_PAT_WRITING ||
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
    const DEPLOY_HOOK =
      process.env.VERCEL_DEPLOY_HOOK_URL_WRITING ||
      process.env.VERCEL_DEPLOY_HOOK_URL;

    if (!TOKEN) throw new Error("Missing GitHub token");

    const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
    console.log("🪶 Save poem request:", { OWNER, REPO, BRANCH, FILE_PATH });

    // 1️⃣ --- FETCH EXISTING FILE TO GET SHA ---
    console.log("🔍 Fetching current file:", `${apiBase}?ref=${BRANCH}`);
    const getRes = await fetch(`${apiBase}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!getRes.ok) {
      const errText = await getRes.text();
      console.error("❌ Failed to fetch writings.json:", getRes.status, errText);
      throw new Error("Failed to fetch current writings.json");
    }

    const getJson = await getRes.json();
    const sha = getJson.sha;
    const oldContent = JSON.parse(
      Buffer.from(getJson.content, "base64").toString("utf8")
    );

    // 2️⃣ --- UPDATE POEMS SECTION ---
    type Poem = { slug: string; title: string; content: string; date?: string };
const poems: Poem[] = Array.isArray(oldContent.poems) ? oldContent.poems : [];

const existingIndex = poems.findIndex((p) => p.slug === slug);

    const newPoem = {
      slug,
      title,
      content,
      date: new Date().toISOString(),
    };

    if (existingIndex >= 0) poems[existingIndex] = newPoem;
    else poems.push(newPoem);

    const updatedContent = JSON.stringify(
      { ...oldContent, poems },
      null,
      2
    );
    const b64 = Buffer.from(updatedContent, "utf8").toString("base64");

    // 3️⃣ --- COMMIT TO GITHUB ---
    console.log("📝 Committing update to GitHub...");
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Update writings.json (poem: ${slug})`,
        content: b64,
        sha,
        branch: BRANCH,
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("❌ GitHub PUT failed:", putRes.status, errText);
      throw new Error("GitHub PUT failed");
    }

    const putJson = await putRes.json();
    console.log("✅ Commit success:", putJson.commit?.html_url);

    // 4️⃣ --- TRIGGER DEPLOY HOOK (optional)
    if (DEPLOY_HOOK) {
      try {
        await fetch(DEPLOY_HOOK, { method: "POST" });
        console.log("🚀 Deploy hook triggered successfully");
      } catch (err) {
        console.warn("⚠️ Deploy hook trigger failed:", err);
      }
    }

    return NextResponse.json({ success: true, commit: putJson.commit });
  } catch (err: any) {
    console.error("💥 Save poem error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save poem" },
      { status: 500 }
    );
  }
}
