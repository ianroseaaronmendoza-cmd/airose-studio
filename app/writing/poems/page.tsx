"use client";

import React, { useState, useEffect } from "react";
import { useEditor } from "@/app/context/EditorContext";

export default function PoemsEditorPage() {
  const { isAuthenticated, editorMode, loading } = useEditor();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<{ poems: any[] }>({ poems: [] });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all poems
  const fetchPoems = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/writings/poems");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ poems: [] });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPoems();
  }, []);

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setContent("");
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setError("");

    try {
      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poems",
          slug,
          title,
          content,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Save failed");
      } else {
        resetForm();
        await fetchPoems();
      }
    } catch {
      setError("Save failed");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete poem "${slug}"?`)) return;

    try {
      const res = await fetch(`/api/writings/poems?slug=${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchPoems();
      alert("Poem deleted successfully!");
    } catch {
      alert("Error deleting poem");
    }
  };

  const loadForEdit = (poem: any) => {
    setSlug(poem.slug);
    setTitle(poem.title);
    setContent(poem.content);
    setError("");
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">
        Checking editor mode...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 text-gray-100 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Poems — Editor</h1>

      {/* Gate editor access */}
      {!isAuthenticated || !editorMode ? (
        <p className="text-center text-gray-500 italic">
          You must log in as an editor to create or edit poems.
        </p>
      ) : (
        <>
          <section className="mb-8 rounded-lg border border-gray-700 bg-gray-900/70 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-semibold">
              Create or Update Poem
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block mb-1 text-gray-300" htmlFor="slug">
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-new-poem"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A Poem Title"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300" htmlFor="content">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your poem here..."
                  rows={10}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                  required
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={publishing}
                  className={`rounded-md px-6 py-2 text-white ${
                    publishing
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700"
                  }`}
                >
                  {publishing ? "Publishing..." : "Save & Publish"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={publishing}
                  className={`rounded-md border border-gray-600 bg-transparent px-6 py-2 text-gray-300 ${
                    publishing
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-800"
                  }`}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      {/* All Poems Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">All Poems</h2>
        {refreshing ? (
          <p>Loading poems...</p>
        ) : data.poems.length === 0 ? (
          <p className="text-gray-500">No poems yet.</p>
        ) : (
          <ul className="space-y-4">
            {data.poems.map((poem) => (
              <li
                key={poem.slug}
                className="rounded-md border border-gray-700 bg-gray-900/70 p-4"
              >
                <h3 className="text-lg font-semibold text-gray-100">
                  {poem.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">/{poem.slug}</p>
                <pre className="whitespace-pre-wrap text-gray-200">
                  {poem.content}
                </pre>

                {isAuthenticated && editorMode && (
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => loadForEdit(poem)}
                      disabled={publishing}
                      className="rounded-md border border-gray-600 bg-transparent px-4 py-1 text-gray-300 hover:bg-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(poem.slug)}
                      disabled={publishing}
                      className="rounded-md border border-red-500 bg-transparent px-4 py-1 text-red-400 hover:bg-red-600/20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
