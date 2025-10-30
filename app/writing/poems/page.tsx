"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useEditor } from "@/app/context/EditorContext";

export default function PoemsPage() {
  const [data, setData] = useState<{ poems: any[] }>({ poems: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { editorMode } = useEditor();

  useEffect(() => {
    async function loadPoems() {
      try {
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        setData(json);
      } catch {
        setData({ poems: [] });
      } finally {
        setLoading(false);
      }
    }
    loadPoems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug, title, content }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setSlug("");
      setTitle("");
      setContent("");
      setShowForm(false);

      const updated = await fetch("/api/writings/poems", { cache: "no-store" });
      setData(await updated.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this poem?")) return;
    try {
      const res = await fetch("/api/writings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      const updated = await fetch("/api/writings/poems", { cache: "no-store" });
      setData(await updated.json());
    } catch {
      alert("Error deleting poem");
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Poems</h1>

      {editorMode && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700"
          >
            {showForm ? "Cancel" : "Add Poem"}
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-8 rounded-lg border border-gray-700 bg-gray-900/70 p-6 space-y-4"
        >
          <input
            type="text"
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
            required
          />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
            required
          />

          <textarea
            rows={8}
            placeholder="Write your poem..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
            required
          />

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save & Publish"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">All Poems</h2>
        {loading ? (
          <p>Loading poems...</p>
        ) : data.poems.length === 0 ? (
          <p className="text-gray-500">No poems yet.</p>
        ) : (
          <div className="space-y-4">
            {data.poems.map((poem) => (
              <div
                key={poem.slug}
                className="border border-gray-700 rounded-lg bg-gray-900/70 p-4"
              >
                <Link href={`/writing/poems/${poem.slug}`}>
                  <h3 className="text-lg font-semibold text-pink-400 hover:underline">
                    {poem.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">/{poem.slug}</p>

                {editorMode && (
                  <div className="flex gap-3">
                    <Link href={`/writing/poems/${poem.slug}`}>
                      <button className="px-4 py-1 border border-gray-500 rounded hover:bg-gray-800">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(poem.slug)}
                      className="px-4 py-1 border border-red-600 text-red-400 rounded hover:bg-red-900/40"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
