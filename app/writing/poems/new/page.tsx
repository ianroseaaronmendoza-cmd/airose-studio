"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import BackButton from "@/components/BackButton";
import { slugify } from "slugify"; // You can use a utility to slugify titles

export default function NewPoemPage() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newSlug = slugify(title, { lower: true }); // Generating a new slug

      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "poems",
          slug: newSlug, // New poem will have a unique slug
          title,
          content,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save poem");
      }

      router.push(`/writing/poems/${newSlug}`); // Redirect to the newly created poem
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Save failed — check console for details");
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
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8">
      <BackButton label="Back to Poems" />

      <h1 className="text-2xl font-bold mt-4 mb-6">New Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Poem"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/writing/poems")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
