import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";
import ChapterEditor from "@/components/ChapterEditor";

export default function ChapterEditorPage() {
  const { novelSlug, chapterSlug } = useParams<{
    novelSlug: string;
    chapterSlug?: string;
  }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState("<p>Start writing your chapter...</p>");
  const editorRef = useRef<any>(null);

  const isNew = !chapterSlug;

  // Block if not in editor mode
  useEffect(() => {
    if (!editorMode) {
      navigate(`/writing/novels/${novelSlug}`);
    }
  }, [editorMode, navigate, novelSlug]);

  // Load chapter if editing
  useEffect(() => {
    if (!isNew && novelSlug && chapterSlug) {
      (async () => {
        try {
          const res = await fetch(
            `/data/novels/${novelSlug}/chapters/${chapterSlug}.json`
          );
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title || "");
            setInitialContent(data.content || data.body || "<p>Start writing your chapter...</p>");
          }
        } catch (err) {
          console.error("Load failed:", err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [isNew, novelSlug, chapterSlug]);

  // Save chapter
  const handleSave = async () => {
    setSaving(true);
    try {
      const html = editorRef.current?.getContent() || "";
      await fetch("/dev/chapter/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelSlug,
          chapterSlug,
          title,
          html,
          updatedAt: Date.now(),
        }),
      });
      // Redirect to manage chapters after save
      navigate(`/writing/novels/edit/${novelSlug}/chapters`);
    } catch (err) {
      // Show error
      alert("Failed to save chapter.");
    } finally {
      setSaving(false);
    }
  };

  if (!editorMode) return null;

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <BackButton
        to={`/writing/novels/edit/${novelSlug}/chapters`}
        label="Back to Manage Chapters"
      />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        {isNew ? "New Chapter" : "Edit Chapter"}
      </h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-400 mb-2">Chapter Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title"
            className="w-full bg-neutral-900 border border-neutral-800 rounded text-white px-4 py-2"
          />
        </div>

        {/* TinyMCE Editor via ChapterEditor component */}
        <ChapterEditor
          initialHtml={initialContent}
          onReady={(editor) => {
            editorRef.current = editor;
          }}
        />

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/writing/novels/edit/${novelSlug}/chapters`)}
            className="px-6 py-2 border border-pink-400 text-pink-400 bg-transparent hover:bg-pink-400 hover:text-white rounded font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Chapter"}
          </button>
        </div>
      </div>
    </div>
  );
}
