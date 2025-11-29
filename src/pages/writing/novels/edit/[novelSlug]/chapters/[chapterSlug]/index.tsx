import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "@/components/BackButton";
import ChapterEditor from "@/components/ChapterEditor";

import {
  loadChapter,
  saveChapter as saveChapterFS,
  deleteChapter as deleteChapterFS,
} from "@/client/api/novels";

export default function EditChapterPage() {
  const { novelSlug, chapterSlug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [chapter, setChapter] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  //
  // Load chapter from FS
  //
  useEffect(() => {
    if (!novelSlug || !chapterSlug) return;

    (async () => {
      const data = await loadChapter(novelSlug, chapterSlug);
      if (!data) {
        setChapter(null);
        setLoading(false);
        return;
      }

      setChapter(data);
      setTitle(data.title);
      setLoading(false);
    })();
  }, [novelSlug, chapterSlug]);

  //
  // Save Chapter (JSON FS)
  //
  const saveChapter = async () => {
    if (!editor) return alert("Editor not ready.");
    if (!novelSlug || !chapterSlug) return;

    const html = editor.getHTML();

    try {
      setSaving(true);

      await saveChapterFS({
        novelSlug,
        chapterSlug,
        title: title.trim(),
        html,
      });

      alert("Chapter updated!");

      navigate(`/writing/novels/${novelSlug}/edit/chapters/${chapterSlug}`);
    } catch (err: any) {
      alert("Failed to save chapter: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  //
  // Delete Chapter
  //
  const deleteCurrentChapter = async () => {
    if (!novelSlug || !chapterSlug) return;

    if (!confirm("Delete this chapter? This cannot be undone.")) return;

    try {
      await deleteChapterFS(novelSlug, chapterSlug);

      alert("Chapter deleted");
      navigate(`/writing/novels/${novelSlug}/edit/chapters`);
    } catch (err: any) {
      alert("Delete failed: " + err?.message);
    }
  };

  // LOADING STATES
  if (loading)
    return <p className="text-gray-400 p-8">Loading chapter...</p>;

  if (!chapter)
    return <p className="text-red-400 p-8">Chapter not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-100">

      <BackButton
        to={`/writing/novels/${novelSlug}/edit/chapters`}
        label="Back to Chapters"
      />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        Edit Chapter
      </h1>

      <div className="space-y-6">

        {/* Title */}
        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Title</div>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-900 border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        {/* CHAPTER EDITOR */}
        <ChapterEditor
          initialHtml={chapter.body || ""}
          onReady={setEditor}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-between mt-4">
          {/* DELETE BUTTON */}
          <button
            onClick={deleteCurrentChapter}
            className="px-5 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
          >
            Delete Chapter
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={saveChapter}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
