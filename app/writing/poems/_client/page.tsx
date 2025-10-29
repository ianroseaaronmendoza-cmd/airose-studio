// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { poems as initialPoems } from "@/data/writings";
import BackButton from "@/components/BackButton";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  mergeData,
  markDeleted,
} from "@/lib/localstore";

type Poem = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function PoemsClient() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "poems";
  const DELETED_KEY = "poems_deleted";

  const [poems, setPoems] = useState<Poem[]>([]);

  const reloadMerged = () => {
    const local = loadFromStorage(LOCAL_KEY);
    const deleted = loadFromStorage(DELETED_KEY);
    setPoems(mergeData(initialPoems, local, deleted));
  };

  useEffect(() => {
    reloadMerged();
  }, []);

  const makeSlug = (title = "untitled") => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    return `${base}-${Date.now()}`;
  };

  const handleAddNew = () => {
    const title = "Untitled";
    const slug = makeSlug(title);
    const newPoem: Poem = { slug, title, content: "", date: new Date().toISOString().slice(0, 10) };
    const local = loadFromStorage(LOCAL_KEY);
    saveToStorage(LOCAL_KEY, [...local, newPoem]);
    reloadMerged();
    router.push(`/writing/poems/${slug}`);
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this poem?")) return;
    removeFromStorage(LOCAL_KEY, slug);
    const isDefault = (initialPoems || []).some((p) => p.slug === slug);
    if (isDefault) markDeleted(slug, DELETED_KEY);
    reloadMerged();
  };

  const localSlugs = new Set(
    typeof window !== "undefined" ? loadFromStorage(LOCAL_KEY).map((p) => p.slug) : []
  );

  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        {editorMode && (
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
          >
            + Add poem
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-6">Poems</h1>

      <div className="space-y-4">
        {poems.length === 0 ? (
          <p className="text-gray-400">No poems yet.</p>
        ) : (
          poems.map((p) => (
            <article
              key={p.slug}
              className="p-4 border border-gray-800 rounded hover:bg-gray-900 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/writing/poems/${p.slug}`}
                    className="text-lg font-medium text-pink-400 hover:underline"
                  >
                    {p.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-gray-500">{p.date}</p>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-gray-400">{localSlugs.has(p.slug) ? "local" : "default"}</span>
                  {editorMode && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => router.push(`/writing/poems/${p.slug}`)}
                        className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug)}
                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                {(p.content || "").slice(0, 250)}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

