"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useEditor } from "@/app/context/EditorContext";

// Define poem type
interface Poem {
  slug: string;
  title: string;
  content: string;
}

export default function PoemsPage() {
  const { editorMode } = useEditor();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      try {
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        setPoems(json.poems || []);
      } catch {
        setPoems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPoems();
  }, []);

  if (loading) return <p className="text-gray-400 px-6 py-6">Loading poems...</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Poems</h1>
        {editorMode && (
          <Link
            href="/writing/poems/new"
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Add Poem
          </Link>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">All Poems</h2>
        {poems.length === 0 ? (
          <p className="text-gray-500">No poems yet.</p>
        ) : (
          <ul className="space-y-4">
            {poems.map((poem: Poem) => (
              <li
                key={poem.slug}
                className="rounded-md border border-gray-700 bg-gray-900/70 p-4 hover:bg-gray-800 transition"
              >
                <Link
                  href={`/writing/poems/${poem.slug}`}
                  className="block hover:text-pink-400"
                >
                  <h3 className="text-lg font-semibold text-gray-100">
                    {poem.title}
                  </h3>
                  <p className="text-sm text-gray-400">/{poem.slug}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
