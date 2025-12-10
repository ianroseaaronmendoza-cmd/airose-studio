import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { NovelMeta } from "../../../../components/NovelForm";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";

interface Chapter {
  slug: string;
  title: string;
  position?: number;
  updatedAt?: number;
}

export default function NovelDetail() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [meta, setMeta] = useState<NovelMeta | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNovel();
  }, [novelSlug]);

  async function loadNovel() {
    try {
      // Load novel meta
      const metaRes = await fetch(`/data/novels/${novelSlug}/meta.json`);
      if (metaRes.ok) {
        setMeta(await metaRes.json());
      }

      // Load chapters index
      const chaptersRes = await fetch(`/data/novels/${novelSlug}/chapters/index.json`);
      if (chaptersRes.ok) {
        const chaps = await chaptersRes.json();
        setChapters(chaps.sort((a: Chapter, b: Chapter) => 
          (a.position || 0) - (b.position || 0)
        ));
      }
    } catch (err) {
      console.error("Failed to load novel:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete novel "${meta?.title}"?`)) return;

    try {
      const res = await fetch("/dev/novel/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: novelSlug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      navigate("/writing/novels");
    } catch (err: any) {
      alert("Delete failed: " + (err?.message || err));
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!meta) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-gray-300 mb-4">Novel Not Found</h2>
        <Link to="/writing/novels" className="text-pink-500 hover:underline">
          ← Back to Novels
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      {/* ✅ Add BackButton here */}
      <BackButton to="/writing/novels" label="Back to Novels" className="mb-6" />

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        {meta.coverUrl && (
          <img
            src={meta.coverUrl}
            alt={meta.title}
            className="w-32 h-44 sm:w-48 sm:h-64 object-cover rounded-lg"
          />
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-pink-400 mb-2">{meta.title}</h1>
          
          {meta.summary && (
            <p className="text-gray-400 mb-4">{meta.summary}</p>
          )}

          {meta.note && (
            <div className="bg-neutral-900 p-4 rounded mb-4">
              <h3 className="text-sm text-gray-500 mb-2">Author's Note</h3>
              <p className="text-gray-300">{meta.note}</p>
            </div>
          )}

          {/* Editor Controls - Only visible in editor mode */}
          {editorMode && (
            <div className="flex gap-3 flex-wrap">
              <Link
                to={`/writing/novels/edit/${novelSlug}`}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white"
              >
                Edit Novel Details
              </Link>

              <Link
                to={`/writing/novels/edit/${novelSlug}/chapters`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
              >
                Manage Chapters
              </Link>

              <Link
                to={`/writing/novels/edit/${novelSlug}/chapters/new`}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-gray-300"
              >
                + New Chapter
              </Link>

              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-950 rounded"
              >
                Delete Novel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapters List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Chapters</h2>

        {chapters.length === 0 ? (
          <p className="text-gray-500">No chapters yet.</p>
        ) : (
          <div className="space-y-2">
            {chapters.map((ch) => (
              <Link
                key={ch.slug}
                to={`/writing/novels/${novelSlug}/chapters/${ch.slug}/read`}
                className="block p-4 bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition"
              >
                <h3 className="text-gray-200">{ch.title}</h3>
                {ch.updatedAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Updated: {new Date(ch.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}