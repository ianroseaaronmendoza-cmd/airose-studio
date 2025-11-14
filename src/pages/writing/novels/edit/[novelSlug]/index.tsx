import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BackButton from "@/components/BackButton";
import { useEditor } from "@/context/EditorContext";
import { API_BASE } from "@/config";

type Chapter = {
  id: number;
  title: string;
  slug: string;
  position: number;
  updatedAt: string;
};

export default function ChaptersListPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const { editorMode } = useEditor();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [novelSlug]);

  async function load() {
    if (!novelSlug) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/novels/${novelSlug}/chapters`);
      setChapters(res.data || []);
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  }

  function openChapter(ch: Chapter) {
    if (editorMode) {
      // Editor mode → open editor
      navigate(`/writing/novels/edit/${novelSlug}/chapters/${ch.slug}`);
    } else {
      // Public mode → open public read page
      navigate(`/writing/novels/${novelSlug}/${ch.slug}`);
    }
  }

  function handleNew() {
    navigate(`/writing/novels/edit/${novelSlug}/chapters/new`);
  }

  async function handleDelete(ch: Chapter) {
    if (!window.confirm("Delete chapter?")) return;
    try {
      await axios.delete(`${API_BASE}/api/novels/${novelSlug}/chapters/${ch.slug}`);
      setChapters((prev) => prev.filter((p) => p.id !== ch.id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  }

  function handleReorder() {
    navigate(`/writing/novels/edit/${novelSlug}/chapters/reorder`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">
      <BackButton to={`/writing/novels`} label="Back to Novels" className="mb-6" />

      <h2 className="text-4xl font-bold text-pink-400 mb-2">Chapters</h2>
      <p className="text-gray-400 mb-6">Manage or read chapters for this story.</p>

      {editorMode && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleNew}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-md"
          >
            + New Chapter
          </button>
          <button
            onClick={handleReorder}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-xl"
          >
            Reorder
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading chapters...</p>
      ) : chapters.length === 0 ? (
        <p className="text-gray-400 italic">No chapters yet. Create one above.</p>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              onClick={() => openChapter(ch)}
              className="bg-[#0f0f10] border border-gray-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-pink-400 transition"
            >
              <div>
                <div className="text-lg font-semibold text-pink-300">
                  {ch.title || "Untitled"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Updated {new Date(ch.updatedAt).toLocaleString()}
                </div>
              </div>

              {editorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(ch);
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
