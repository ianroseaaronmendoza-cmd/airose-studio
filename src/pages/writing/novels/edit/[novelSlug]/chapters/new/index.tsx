import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "@/components/BackButton";
import ChapterEditor from "@/components/ChapterEditor";

import {
  loadChapters,
  loadNovel,
  saveChapter,
} from "@/client/api/novels";

import slugify from "slugify";

export default function NewChapterPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const [editor, setEditor] = useState<any>(null);

  const [existingChapters, setExistingChapters] = useState<any[]>([]);
  const [novel, setNovel] = useState<any>(null);

  //
  // Load novel + chapters
  //
  useEffect(() => {
    if (!novelSlug) return;

    (async () => {
      setNovel(await loadNovel(novelSlug));
      setExistingChapters(await loadChapters(novelSlug));
    })();
  }, [novelSlug]);

  //
  // Generate unique chapter slug
  //
  const generateSlug = () => {
    const base = slugify(customSlug || title || "chapter", {
      lower: true,
      strict: true,
    });

    let final = base;
    let counter = 1;

    while (existingChapters.some((c) => c.slug === final)) {
      final = `${base}-${counter++}`;
    }

    return final;
  };

  //
  // Save Chapter
  //
  const saveNewChapter = async () => {
    if (!editor) return alert("Editor not ready.");
    if (!title.trim()) return alert("Title is required.");
    if (!novelSlug) return;

    const html = editor.getHTML();
    const chapterSlug = generateSlug();

    try {
      setSaving(true);

      await saveChapter({
        novelSlug,
        chapterSlug,
        title: title.trim(),
        html,
      });

      alert("Chapter created!");

      navigate(
        `/writing/novels/${novelSlug}/edit/chapters/${chapterSlug}`
      );
    } catch (err: any) {
      alert("Failed: " + err?.message);
    } finally {
      setSaving(false);
    }
  };

  if (!novel)
    return (
      <div className="p-10 text-gray-300 text-center">
        Loading novel...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-100">
      <BackButton
        to={`/writing/novels/${novelSlug}/edit/chapters`}
        label="Back to Chapters"
      />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        New Chapter for {novel.title}
      </h1>

      <div className="space-y-6">
        {/* Title */}
        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Title</div>
          <input
            className="w-full rounded border bg-neutral-900 px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chapter title"
          />
        </label>

        {/* Manual Slug (optional) */}
        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Slug</div>
          <input
            className="w-full rounded border bg-neutral-900 px-3 py-2"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder="Leave blank to auto-generate"
          />
        </label>

        {/* Editor */}
        <ChapterEditor initialHtml="" onReady={setEditor} />

        {/* Save Button */}
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
