"use client";

import React, { useEffect, useState } from "react";
import { useEditor } from "@\/app\/context\/EditorContext";
import BackButton from "@\/app\/components\/BackButton";

type Poem = {
  slug: string;
  title: string;
  content: string;
  date: string;
};

export default function PoemsClient() {
  const { editorMode } = useEditor();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/writings?type=poems")
      .then((res) => res.json())
      .then(setPoems)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const newPoem: Poem = {
      slug: `poem-${Date.now()}`,
      title: "Untitled Poem",
      content: "",
      date: new Date().toISOString().slice(0, 10),
    };
    await fetch("/api/writings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "poems", item: newPoem }),
    });
    setPoems((prev) => [...prev, newPoem]);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this poem?")) return;
    await fetch(`/api/writings?type=poems&slug=${slug}`, { method: "DELETE" });
    setPoems((prev) => prev.filter((p) => p.slug !== slug));
  };

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Poems</h1>
        {editorMode && (
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add Poem
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading poems...</p>
      ) : poems.length === 0 ? (
        <p className="text-gray-400">No poems yet.</p>
      ) : (
        poems.map((p) => (
          <div
            key={p.slug}
            className="p-4 border border-gray-800 rounded mb-3 hover:bg-gray-900"
          >
            <h2 className="text-lg font-medium">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.date}</p>
            {editorMode && (
              <button
                onClick={() => handleDelete(p.slug)}
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





