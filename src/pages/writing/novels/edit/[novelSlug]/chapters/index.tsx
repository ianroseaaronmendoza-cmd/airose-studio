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
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { editorMode } = useEditor();
  const navigate = useNavigate();

  // -------------------------
  // Load Novel + Chapters
  // -------------------------
  useEffect(() => {
    if (!novelSlug) return;
    load();
  }, [novelSlug]);

  async function load() {
    try {
      setLoading(true);

      const novelRes = await axios.get(`${API_BASE}/api/novels/${novelSlug}`);
      setNovel(novelRes.data);

      const chapterRes = await axios.get(
        `${API_BASE}/api/novels/${novelSlug}/chapters`
      );
      setChapters(chapterRes.data || []);
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // Reorder Chapter (↑ / ↓)
  // -------------------------
  async function moveChapter(chapterSlug: string, direction: "up" | "down") {
    try {
      await axios.patch(`${API_BASE}/api/novels/chapters/reorder`, {
        novelSlug,
        chapterSlug,
        direction,
      });

      // refresh list
      load();
    } catch (err) {
      console.error("Failed to reorder:", err);
      alert("Reorder failed.");
    }
  }

  // -------------------------
  // Delete Chapter
  // -------------------------
  async function handleDelete(ch: Chapter) {
    if (!window.confirm(`Delete chapter "${ch.title}"?`)) return;
    try {
      await axios.delete(
        `${API_BASE}/api/novels/${novelSlug}/chapters/${ch.slug}`
      );
      load();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">
      {/* BACK */}
      <div className="mb-6">
        <BackButton to="/writing/novels" label="Back to Novels" />
      </div>

      {/* ---------------------- */}
      {/* HEADER — Title + Add   */}
      {/* ---------------------- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-pink-400 mb-1">
            {novel?.title || "Chapters"}
          </h2>
          <p className="text-gray-400">
            {editorMode
              ? "Edit or manage the chapters in this story."
              : "Read the chapters in this story."}
          </p>
        </div>

        {/* Add Chapter Button (Editor Mode Only) */}
        {editorMode && (
          <button
            onClick={() =>
              navigate(`/writing/novels/edit/${novelSlug}/chapters/new`)
            }
            className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-md font-semibold shadow transition"
          >
            + Chapter
          </button>
        )}
      </div>

      {/* ---------------------- */}
      {/* CHAPTER LIST           */}
      {/* ---------------------- */}
      {loading ? (
        <p className="text-gray-400">Loading chapters...</p>
      ) : chapters.length === 0 ? (
        <p className="text-gray-400 italic">
          {editorMode
            ? "No chapters yet. Create one above."
            : "No chapters available."}
        </p>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, i) => (
            <div
              key={ch.id}
              onClick={() => {
                if (editorMode) {
                  navigate(
                    `/writing/novels/edit/${novelSlug}/chapters/${ch.slug}`
                  );
                } else {
                  navigate(`/writing/novels/${novelSlug}/chapters/${ch.slug}`);
                }
              }}
              className="
                bg-[#0f0f10] border border-gray-800 rounded-xl p-4 
                flex items-center justify-between cursor-pointer
                transition hover:border-pink-500
              "
            >
              {/* Chapter details */}
              <div>
                <div className="text-lg font-semibold text-pink-300">
                  {ch.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Updated {new Date(ch.updatedAt).toLocaleString()}
                </div>
              </div>

              {/* right controls */}
              {editorMode && (
                <div
                  className="flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Reorder Buttons */}
                  <button
                    disabled={i === 0}
                    onClick={() => moveChapter(ch.slug, "up")}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-gray-300 disabled:opacity-30"
                  >
                    ↑
                  </button>

                  <button
                    disabled={i === chapters.length - 1}
                    onClick={() => moveChapter(ch.slug, "down")}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-gray-300 disabled:opacity-30"
                  >
                    ↓
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() =>
                      navigate(
                        `/writing/novels/edit/${novelSlug}/chapters/${ch.slug}`
                      )
                    }
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Edit →
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(ch)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
