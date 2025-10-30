"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useEditor } from "@/app/context/EditorContext";

interface Poem { slug: string; title: string; content: string }

export default function PoemsPage() {
  const { editorMode } = useEditor();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/writings/poems", { cache: "no-store" });
      const json = await res.json();
      setPoems(json.poems || []);
      console.log("Loaded poems:", json.poems);
    } catch (err) {
      console.error("Failed to load poems", err);
      setPoems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Poems</h1>
        {editorMode && (
          <Link href="/writing/poems/new" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm">
            Add Poem
          </Link>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold">All Poems</h2>

        {loading ? (
          <p className="text-gray-400">Loading poems…</p>
        ) : poems.length === 0 ? (
          <p className="text-gray-500">No poems yet.</p>
        ) : (
          <ul className="space-y-4">
            {poems.map((poem) => (
              <li key={poem.slug} className="rounded-md border border-gray-700 bg-gray-900/70 p-4 hover:bg-gray-800 transition">
                <Link href={`/writing/poems/${poem.slug}`} className="block">
                  <h3 className="text-lg font-semibold text-pink-400">{poem.title}</h3>
                  <p className="text-sm text-gray-400">/{poem.slug}</p>
                </Link>

                {editorMode && (
                  <div className="mt-3 flex gap-3">
                    <Link href={`/writing/poems/${poem.slug}`}>
                      <button className="px-3 py-1 border border-gray-500 rounded">Edit</button>
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this poem?")) return;
                        const res = await fetch("/api/writings/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "poems", slug: poem.slug }),
                        });
                        const json = await res.json();
                        console.log("Delete response:", json);
                        if (!res.ok) return alert(json.error || "Delete failed");
                        // refresh
                        await load();
                      }}
                      className="px-3 py-1 border border-red-600 text-red-400 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
