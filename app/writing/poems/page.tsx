"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEditor } from "@/app/context/EditorContext";
import BackButton from "@/components/BackButton";

export default function PoemsPage() {
  const { editorMode } = useEditor();
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/writings/poems");
      const data = await res.json();
      setPoems(data.poems || []);
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <BackButton label="Back to Writing" />

      <div className="flex justify-between items-center mt-6 mb-4">
        <h1 className="text-3xl font-semibold">Poems</h1>
        {editorMode && (
          <button
            onClick={() => (window.location.href = "/writing/poems/new")}
            className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700"
          >
            + New Poem
          </button>
        )}
      </div>

      <div className="space-y-4">
        {poems.map((poem: any) => (
          <div
            key={poem.slug}
            className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-lg"
          >
            <Link href={`/writing/poems/${poem.slug}`}>
              <div className="text-pink-400 font-semibold text-lg hover:underline">
                {poem.title}
              </div>
            </Link>
            <p className="text-sm opacity-70 mt-1 line-clamp-3">
              {poem.content.slice(0, 300)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
