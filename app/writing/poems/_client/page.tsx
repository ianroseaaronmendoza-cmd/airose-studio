"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Poem = {
  slug: string;
  title: string;
  content: string;
};

type DataShape = {
  poems: Poem[];
  blogs?: any[];
  novels?: any[];
};

const READ_URL = "/api/writings/poems";
const SAVE_URL = "/api/writings/save";

function nowTs() {
  return Date.now().toString();
}

export default function PoemsClient() {
  const [data, setData] = useState<DataShape>({ poems: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<null | "ok" | "fail">(null);
  const lastSavedSlugRef = useRef<string | null>(null);

  async function fetchPoems({ bust = true }: { bust?: boolean } = {}) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${READ_URL}${bust ? `?t=${nowTs()}` : ""}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const json = (await res.json()) as DataShape;
      setData({
        poems: Array.isArray(json.poems) ? json.poems : [],
        blogs: json.blogs ?? [],
        novels: json.novels ?? [],
      });
    } catch (e: any) {
      setError(e?.message ?? "Failed to load poems");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPoems();
  }, []);

  const existingSlugs = useMemo(
    () => new Set((data.poems || []).map((p) => p.slug)),
    [data.poems]
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPublished(null);

    if (!slug.trim()) return alert("Slug is required");
    if (!title.trim()) return alert("Title is required");

    try {
      setPublishing(true);
      lastSavedSlugRef.current = slug.trim();

      const res = await fetch(SAVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poems",
          slug: slug.trim(),
          title: title.trim(),
          content,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Save failed: ${msg}`);
      }

      await waitForPublish({ slug: slug.trim() });
      setPublished("ok");
      await fetchPoems({ bust: true });
    } catch (err: any) {
      console.error(err);
      setPublished("fail");
      alert(err?.message ?? "Save failed");
    } finally {
      setPublishing(false);
    }
  }

  async function waitForPublish({
    slug,
    timeoutMs = 180000,
    intervalMs = 8000,
  }: {
    slug: string;
    timeoutMs?: number;
    intervalMs?: number;
  }) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await fetch(`${READ_URL}?t=${nowTs()}`, { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as DataShape;
          if (Array.isArray(json.poems) && json.poems.some((p) => p.slug === slug)) {
            return;
          }
        }
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error("Publish timed out. The deploy may still be running.");
  }

  function loadForEdit(p: Poem) {
    setSlug(p.slug);
    setTitle(p.title);
    setContent(p.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setSlug("");
    setTitle("");
    setContent("");
    setPublished(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <h1>Poems — Editor</h1>

      <section style={{ marginBottom: 24, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h2 style={{ marginBottom: 12 }}>Create or Update Poem</h2>
        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <div>Slug</div>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-new-poem"
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
              />
              {slug && existingSlugs.has(slug) && (
                <small style={{ color: "#6b7280" }}>
                  This slug exists — saving will update the poem.
                </small>
              )}
            </label>

            <label>
              <div>Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A Poem Title"
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
              />
            </label>

            <label>
              <div>Content</div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your poem here..."
                rows={10}
                style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6, fontFamily: "inherit" }}
              />
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="submit"
                disabled={publishing}
                style={{
                  padding: "10px 14px",
                  background: publishing ? "#9ca3af" : "#111827",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: publishing ? "not-allowed" : "pointer",
                }}
              >
                {publishing ? "Publishing…" : "Save & Publish"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={publishing}
                style={{
                  padding: "10px 14px",
                  background: "#fff",
                  color: "#111827",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  cursor: publishing ? "not-allowed" : "pointer",
                }}
              >
                Reset
              </button>
            </div>

            {publishing && (
              <div style={{ color: "#6b7280" }}>
                Publishing… This triggers a deploy and can take 30–120 seconds.
                The list below will refresh automatically once the new version is live.
              </div>
            )}
            {published === "ok" && <div style={{ color: "#059669" }}>Published!</div>}
            {published === "fail" && <div style={{ color: "#dc2626" }}>Publish failed. Check logs.</div>}
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ marginBottom: 12 }}>All Poems</h2>
        {loading ? (
          <div>Loading…</div>
        ) : error ? (
          <div style={{ color: "#dc2626" }}>{error}</div>
        ) : data.poems.length === 0 ? (
          <div>No poems yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {data.poems.map((p) => (
              <li
                key={p.slug}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 12,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ color: "#6b7280" }}>/{p.slug}</div>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    margin: 0,
                    color: "#111827",
                    background: "#fafafa",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #f3f4f6",
                  }}
                >
                  {p.content}
                </pre>
                <div>
                  <button
                    onClick={() => loadForEdit(p)}
                    disabled={publishing}
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#111827",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      cursor: publishing ? "not-allowed" : "pointer",
                    }}
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}