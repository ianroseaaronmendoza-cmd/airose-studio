// src/pages/writing/poems/index.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEditor } from "../../../context/EditorContext";

interface Poem {
  slug: string;
  title: string;
  content: string;
  date?: string;
}

export default function PoemsIndexPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const { editorMode } = useEditor();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPoems = async () => {
      try {
        const res = await fetch("/api/writings/poems");
        const data = await res.json();
        setPoems(data.poems || []);
      } catch (err) {
        console.error("Failed to load poems:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPoems();
    window.addEventListener("poemUpdated", loadPoems);
    return () => window.removeEventListener("poemUpdated", loadPoems);
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this poem?")) return;
    try {
      const res = await fetch("/api/writings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      window.dispatchEvent(new Event("poemUpdated"));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check console.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pb-32 text-gray-100">
      <div className="mb-6">
        <Link
          to="/writing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-pink-400 hover:bg-neutral-800 text-gray-300 rounded-lg transition-all"
        >
          ← Back to Writing
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-pink-400">Poems</h1>
        {editorMode && (
          <button
            onClick={() => navigate("/writing/poems/new")}
            className="bg-pink-600 text-white px-4 py-2 rounded-md"
          >
            + New Poem
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading poems...</p>
      ) : poems.length === 0 ? (
        <p className="text-gray-400">No poems yet.</p>
      ) : (
        <div className="space-y-6">
          {poems.map((p) => (
            <motion.div
              key={p.slug}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="group bg-[#0f0f0f] border border-gray-800 rounded-lg p-6 hover:border-pink-500/50 transition-all"
            >
              {/* ✅ The entire card is now clickable */}
              <Link to={`/writing/poems/${p.slug}`} className="block">
                <h2 className="text-xl font-semibold text-white group-hover:text-pink-300 transition">
                  {p.title}
                </h2>
                {p.date && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(p.date).toLocaleDateString()}
                  </p>
                )}
                <p className="text-gray-400 mt-3 line-clamp-2">
                  {p.content.slice(0, 200)}...
                </p>
              </Link>

              {editorMode && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      navigate(`/writing/poems/edit/${p.slug}`)
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.slug)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
