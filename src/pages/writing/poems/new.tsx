import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useEditor } from "../../../context/EditorContext";
import BackButton from "../../../components/BackButton";

export default function NewPoemPage() {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please provide both title and content.");
      return;
    }

    setSaving(true);

    try {
      const newSlug = slugify(title, { lower: true, strict: true });

      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poems",
          slug: newSlug,
          title,
          content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save poem");
      }

      // ✅ Trigger refresh and redirect to poem list
      window.dispatchEvent(new Event("poemUpdated"));
      navigate("/writing/poems");
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Save failed — check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (!editorMode) {
    return (
      <div className="p-6 text-center text-gray-400">
        <BackButton label="Back to Poems" />
        <p className="mt-6">You must enable Editor Mode to create a poem.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8 pb-32">
      <BackButton label="Back to Poems" />

      <h1 className="text-2xl font-bold mt-4 mb-6">New Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Poem"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/writing/poems")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-md transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
