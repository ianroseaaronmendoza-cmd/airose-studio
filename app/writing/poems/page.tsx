"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import BackButton from "@/components/BackButton";

interface Poem {
  slug: string;
  title: string;
  content: string;
}

export default function PoemsPage() {
  const { editorMode } = useEditor();
  const router = useRouter();

  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        setPoems(json.poems || []);
      } catch (e) {
        console.error("Failed to load poems:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading poems...</p>;

  return (
    <main className="max-w-3xl mx-auto px-6 py-6 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <BackButton label="Back to Writing" />
        {editorMode && (
          <button
            onClick={() => router.push("/writing/poems/new")}
            className="px-3 py-2 bg-pink-600 rounded hover:bg-pink-700 text-sm"
          >
            + New Poem
          </button>
        )}
      </div>

      <h1 className="text-3xl font-semibold mb-4">Poems</h1>
      <p className="text-gray-400 text-sm mb-8">
        A collection of written works and reflections.
      </p>

      {poems.length === 0 ? (
        <p className="text-gray-500 italic">No poems found.</p>
      ) : (
        <div className="space-y-4">
          {poems.map((poem) => (
            <div
              key={poem.slug}
              className="bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 rounded-xl p-4 cursor-pointer transition"
              onClick={() => router.push(`/writing/poems/${poem.slug}`)}
            >
              <h2 className="text-lg font-medium text-pink-400">
                {poem.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {poem.content.slice(0, 180)}
                {poem.content.length > 180 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
