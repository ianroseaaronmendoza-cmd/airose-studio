import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";
import { ChevronUp, ChevronDown, Trash2, Edit } from "lucide-react";

interface Chapter {
  slug: string;
  title: string;
  position: number;
  updatedAt?: number;
}

export default function ManageChaptersPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!editorMode) {
      navigate(`/writing/novels/${novelSlug}`);
    }
  }, [editorMode, navigate, novelSlug]);

  useEffect(() => {
    loadChapters();
  }, [novelSlug]);

  async function loadChapters() {
    try {
      const res = await fetch(`/data/novels/${novelSlug}/chapters/index.json`);
      if (res.ok) {
        const data = await res.json();
        setChapters(
          data.sort((a: Chapter, b: Chapter) => a.position - b.position)
        );
      }
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function moveChapter(index: number, direction: "up" | "down") {
    const newChapters = [...chapters];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newChapters.length) return;

    // Swap
    [newChapters[index], newChapters[swapIndex]] = [
      newChapters[swapIndex],
      newChapters[index],
    ];

    // Update positions
    newChapters.forEach((ch, i) => {
      ch.position = i;
    });

    setChapters(newChapters);

    // Save to backend
    try {
      const res = await fetch("/dev/chapter/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelSlug,
          newOrder: newChapters.map((ch) => ch.slug),
        }),
      });

      if (!res.ok) throw new Error("Reorder failed");
    } catch (err: any) {
      alert("Failed to reorder: " + err.message);
      loadChapters(); // Reload on error
    }
  }

  async function deleteChapter(chapterSlug: string, title: string) {
    if (!confirm(`Delete chapter "${title}"?`)) return;

    try {
      const res = await fetch("/dev/chapter/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug, chapterSlug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      loadChapters();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  }

  if (!editorMode) return null;

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <BackButton to={`/writing/novels/${novelSlug}`} label="Back to Novel" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-400">Manage Chapters</h1>
        <Link
          to={`/writing/novels/edit/${novelSlug}/chapters/new`}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white"
        >
          + New Chapter
        </Link>
      </div>

      {chapters.length === 0 ? (
        <p className="text-gray-500">No chapters yet.</p>
      ) : (
        <div className="space-y-2">
          {chapters.map((ch, index) => (
            <div
              key={ch.slug}
              className="flex items-center gap-3 p-4 bg-neutral-900 rounded border border-neutral-800"
            >
              {/* Reorder Buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveChapter(index, "up")}
                  disabled={index === 0}
                  className={`p-1 rounded ${
                    index === 0
                      ? "text-gray-700 cursor-not-allowed"
                      : "text-gray-400 hover:bg-neutral-800"
                  }`}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveChapter(index, "down")}
                  disabled={index === chapters.length - 1}
                  className={`p-1 rounded ${
                    index === chapters.length - 1
                      ? "text-gray-700 cursor-not-allowed"
                      : "text-gray-400 hover:bg-neutral-800"
                  }`}
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Chapter Info */}
              <div className="flex-1">
                <h3 className="text-gray-200 font-medium">{ch.title}</h3>
                <p className="text-xs text-gray-500">
                  Position: {ch.position + 1}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/writing/novels/edit/${novelSlug}/chapters/${ch.slug}`}
                  className="p-2 text-gray-400 hover:bg-neutral-800 rounded"
                  title="Edit"
                >
                  <Edit size={18} />
                </Link>

                <button
                  onClick={() => deleteChapter(ch.slug, ch.title)}
                  className="p-2 text-red-400 hover:bg-red-950 rounded"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
