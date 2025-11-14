import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BackButton from "@/components/BackButton";
import ChapterEditor from "../../../ChapterEditor";

export default function NewChapterPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const [editor, setEditor] = useState<any>(null);

  const saveNewChapter = async () => {
    if (!editor) return;
    if (!title.trim()) return alert("Title is required.");

    const html = editor.getHTML();

    const finalSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    try {
      setSaving(true);

      const res = await axios.post(
        `/api/novels/${novelSlug}/chapters`,
        {
          title,
          slug: finalSlug,
          body: html,
        },
        { withCredentials: true }
      );

      const created = res.data;

      alert("Chapter created!");

      navigate(
        `/writing/novels/${novelSlug}/chapters/${created.slug}`
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-100">
      <BackButton
        to={`/writing/novels/edit/${novelSlug}/chapters`}
        label="Back to Chapters"
      />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        New Chapter
      </h1>

      <div className="space-y-6">

        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Title</div>
          <input
            className="w-full rounded border bg-neutral-900 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chapter title"
          />
        </label>

        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Slug</div>
          <input
            className="w-full rounded border bg-neutral-900 px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Leave blank to auto-generate"
          />
        </label>

        {/* NEW EDITOR CONNECTION */}
        <ChapterEditor initialHtml="" onReady={setEditor} />

        <div className="flex justify-end">
          <button
            onClick={saveNewChapter}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white"
          >
            {saving ? "Saving..." : "Save Chapter"}
          </button>
        </div>
      </div>
    </div>
  );
}
