import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEditor } from "../../../context/EditorContext";

interface Poem {
  slug: string;
  title: string;
  content: string;
  createdAt?: number;
}

export default function PoemsIndexPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  useEffect(() => {
    loadPoems();
  }, []);

  async function loadPoems() {
    try {
      const res = await fetch("/data/poems/index.json");
      if (res.ok) {
        const data = await res.json();
        setPoems(data);
      }
    } catch (err) {
      console.error("Error loading poems:", err);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Are you sure you want to delete this poem?")) return;

    try {
      const res = await fetch("/dev/poem/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setPoems((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + err);
    }
  }

  return (
    <div className="w-full p-6 text-gray-100 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <div className="mb-6">
        <Link
          to="/writing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-pink-400 hover:bg-neutral-800 text-gray-300 rounded-lg transition-all"
        >
          ← Back to Writing
        </Link>
      </div>

      <h2 className="text-4xl font-bold !text-pink-400 mb-2">Poems</h2>
      <p className="text-gray-400 mb-6">
        A collection of heartfelt verses and reflections.
      </p>

      {editorMode && (
        <button
          onClick={() => navigate("/writing/poems/new")}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold py-2 px-5 rounded-xl mb-6 transition"
        >
          + New Poem
        </button>
      )}

      {poems.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center">
          No poems yet. Create your first verse!
        </p>
      ) : (
        <div className="space-y-4">
          {poems.map((poem) => (
            <div
              key={poem.slug}
              onClick={() => navigate(`/writing/poems/${poem.slug}`)}
              className="p-6 bg-[#111] rounded-2xl border border-gray-800 hover:border-pink-500/50 shadow-sm hover:shadow-pink-500/20 transition cursor-pointer"
            >
              <h3 className="text-xl font-bold !text-pink-300 mb-2">
                {poem.title}
              </h3>
              {poem.createdAt && (
                <p className="text-gray-500 text-xs">
                  {new Date(poem.createdAt).toLocaleDateString()}
                </p>
              )}

              {editorMode && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/writing/poems/edit/${poem.slug}`);
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(poem.slug);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
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
