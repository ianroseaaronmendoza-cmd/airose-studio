import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "@/components/BackButton";
import { useEditor } from "@/context/EditorContext";

import {
  loadChapters,
  loadNovel,
  deleteChapter,
  reorderChapters,
} from "@/client/api/novels";

export default function ChaptersListPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();

  const { editorMode } = useEditor();

  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dragging, setDragging] = useState<string | null>(null);

  // ------------------------------
  // Load novel + chapters
  // ------------------------------
  useEffect(() => {
    if (!novelSlug) return;

    (async () => {
      setNovel(await loadNovel(novelSlug));
      setChapters(await loadChapters(novelSlug));
      setLoading(false);
    })();
  }, [novelSlug]);

  // ------------------------------
  // Drag & Drop Reordering
  // ------------------------------
  function onDragStart(slug: string) {
    setDragging(slug);
  }

  function onDragOver(e: React.DragEvent, targetSlug: string) {
    e.preventDefault();
    if (!dragging || dragging === targetSlug) return;

    const temp = [...chapters];
    const from = temp.findIndex((c) => c.slug === dragging);
    const to = temp.findIndex((c) => c.slug === targetSlug);

    const [moved] = temp.splice(from, 1);
    temp.splice(to, 0, moved);

    setChapters(temp);
  }

  async function onDragEnd() {
    if (!novelSlug) return;

    setDragging(null);

    const newOrder = chapters.map((c) => c.slug);
    try {
      const reordered = await reorderChapters(novelSlug, newOrder);
      setChapters(reordered);
    } catch (err: any) {
      alert("Failed to reorder chapters: " + err?.message);
    }
  }

  // ------------------------------
  // Delete Chapter
  // ------------------------------
  async function handleDelete(slug: string) {
    if (!novelSlug) return;

    if (!confirm("Delete this chapter? This cannot be undone.")) return;

    try {
      await deleteChapter(novelSlug, slug);
      setChapters((prev) => prev.filter((c) => c.slug !== slug));
    } catch (err: any) {
      alert("Delete failed: " + err?.message);
    }
  }

  // ------------------------------
  // Open chapter (edit or read)
  // ------------------------------
  function openChapter(slug: string) {
    if (editorMode) {
      navigate(`/writing/novels/${novelSlug}/edit/chapters/${slug}`);
    } else {
      navigate(`/writing/novels/${novelSlug}/chapters/${slug}`);
    }
  }

  // ------------------------------
  // UI Rendering
  // ------------------------------
  if (loading) {
    return <p className="text-gray-400 p-10">Loading chapters...</p>;
  }

  if (!novel) {
    return <p className="text-red-400 p-10">Novel not found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">

      <BackButton to={`/writing/novels`} label="Back to Novels" className="mb-6" />

      <h2 className="text-4xl font-bold text-pink-400 mb-2">Chapters</h2>
      <p className="text-gray-400 mb-6">Manage or read chapters for this story.</p>


      {/* Buttons (only in editor mode) */}
      {editorMode && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() =>
              navigate(`/writing/novels/${novelSlug}/edit/chapters/new`)
            }
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-md"
          >
            + New Chapter
          </button>
        </div>
      )}

      {/* List */}
      {chapters.length === 0 ? (
        <p className="text-gray-400 italic">No chapters yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch) => (
            <div
              key={ch.slug}
              draggable={editorMode}
              onDragStart={() => editorMode && onDragStart(ch.slug)}
              onDragOver={(e) => editorMode && onDragOver(e, ch.slug)}
              onDragEnd={() => editorMode && onDragEnd()}
              onClick={() => openChapter(ch.slug)}
              className={`bg-[#0f0f10] border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-pink-400 transition cursor-pointer ${
                dragging === ch.slug ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="text-lg font-semibold text-pink-300">
                  {ch.title || "Untitled"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Updated {new Date(ch.updatedAt).toLocaleString()}
                </div>
              </div>

              {/* Delete button (only in editor mode) */}
              {editorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ch.slug);
                  }}
                  className="bg-red-600 px-3 py-1.5 rounded-lg text-sm text-white"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
