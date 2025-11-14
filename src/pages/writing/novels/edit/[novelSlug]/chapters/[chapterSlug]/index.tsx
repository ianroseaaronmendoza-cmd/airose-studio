import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BackButton from "@/components/BackButton";
import ChapterEditor from "../../../ChapterEditor";

export default function EditChapterPage() {
  const { novelSlug, chapterSlug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [chapter, setChapter] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load chapter
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(
          `/api/novels/${novelSlug}/chapters/${chapterSlug}`
        );
        setChapter(res.data);
        setTitle(res.data.title);
      } catch (err: any) {
        alert("Failed to load chapter.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [novelSlug, chapterSlug]);

  const saveChapter = async () => {
    if (!editor) return;

    const html = editor.getHTML();

    try {
      setSaving(true);

      const res = await axios.put(
        `/api/novels/${novelSlug}/chapters/${chapterSlug}`,
        {
          title,
          body: html,
        },
        { withCredentials: true }
      );

      alert("Chapter updated!");

      navigate(`/writing/novels/${novelSlug}/chapters/${chapterSlug}`);

    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 p-8">Loading...</p>;

  if (!chapter) return <p className="text-red-400 p-8">Not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-100">

      <BackButton
        to={`/writing/novels/edit/${novelSlug}/chapters`}
        label="Back to Chapters"
      />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        Edit Chapter
      </h1>

      <div className="space-y-6">

        <label className="block">
          <div className="text-sm text-gray-400 mb-1">Title</div>
          <input
            className="w-full px-3 py-2 rounded bg-neutral-900 border"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <ChapterEditor
          initialHtml={chapter.body || chapter.content || ""}
          onReady={setEditor}
        />

        <div className="flex justify-end">
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
