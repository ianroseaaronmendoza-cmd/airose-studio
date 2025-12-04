import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../../../context/EditorContext";
import BackButton from "../../../components/BackButton";
import { createPoem, slugifyText } from "../../../client/api/poems";

export default function NewPoemPage() {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("Fill all fields");

    setSaving(true);

    const slug = slugifyText(title);

    await createPoem({ slug, title, content });

    window.dispatchEvent(new Event("poemUpdated"));
    navigate("/writing/poems");
  };

  if (!editorMode)
    return (
      <div className="p-6 text-center text-gray-400">
        <BackButton label="Back to Poems" />
        <p className="mt-6">Enable Editor Mode to create poems.</p>
      </div>
    );

  return (
    <div className="w-full text-gray-100 pb-32 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <BackButton label="Back to Poems" />
      <h1 className="text-2xl font-bold mt-4 mb-6">New Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded border border-gray-700 focus:border-pink-500 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded border border-gray-700 focus:border-pink-500 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"
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
            onClick={() => navigate("/writing/poems")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
