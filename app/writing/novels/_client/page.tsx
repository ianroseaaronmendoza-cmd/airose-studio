"use client";

import React, { useEffect, useState } from "react";
import { useEditor } from "@\/app\/context\/EditorContext";
import BackButton from "@\/app\/components\/BackButton";

type Novel = {
  slug: string;
  title: string;
  description: string;
  chapters: string[];
};

export default function NovelsClient() {
  const { editorMode } = useEditor();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/writings?type=novels")
      .then((res) => res.json())
      .then(setNovels)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const newNovel: Novel = {
      slug: `novel-${Date.now()}`,
      title: "Untitled Novel",
      description: "New story description...",
      chapters: [],
    };
    await fetch("/api/writings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "novels", item: newNovel }),
    });
    setNovels((prev) => [...prev, newNovel]);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this novel?")) return;
    await fetch(`/api/writings?type=novels&slug=${slug}`, { method: "DELETE" });
    setNovels((prev) => prev.filter((n) => n.slug !== slug));
  };

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Novels</h1>
        {editorMode && (
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add Novel
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading novels...</p>
      ) : novels.length === 0 ? (
        <p className="text-gray-400">No novels yet.</p>
      ) : (
        novels.map((n) => (
          <div
            key={n.slug}
            className="p-4 border border-gray-800 rounded mb-3 hover:bg-gray-900"
          >
            <h2 className="text-lg font-medium">{n.title}</h2>
            <p className="text-sm text-gray-400">{n.description}</p>
            {editorMode && (
              <button
                onClick={() => handleDelete(n.slug)}
                className="mt-2 px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </main>
  );
}

