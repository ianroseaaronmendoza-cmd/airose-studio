// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { poems as initialPoems } from "@/data/writings";
import BackButton from "@/app/components/BackButton";


type Poem = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function PoemsClient() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const [poems, setPoems] = useState<Poem[]>([]);

  const LOCAL_KEY = "poems";
  const DELETED_KEY = "poems_deleted";

  const loadLocal = (): Poem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const loadDeleted = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DELETED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const buildMerged = (local: Poem[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Poem>();
    (initialPoems ?? []).forEach((p: Poem) => {
      if (!del.has(p.slug)) map.set(p.slug, p);
    });
    (local ?? []).forEach((p: Poem) => {
      if (!del.has(p.slug)) map.set(p.slug, p);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reload = () => {
      const local = loadLocal();
      const deleted = loadDeleted();
      setPoems(buildMerged(local, deleted));
    };
    reload();
    window.addEventListener("storage", reload);
    return () => window.removeEventListener("storage", reload);
  }, []);

  const makeSlug = (title = "untitled") => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "poem";
    let slug = base;
    let i = 1;
    const existing = new Set(poems.map((p) => p.slug));
    while (existing.has(slug)) slug = `${base}-${i++}`;
    return slug;
  };

  const handleAddNew = () => {
    const title = "Untitled";
    const slug = makeSlug(title + "-" + Date.now().toString().slice(-4));
    const newPoem: Poem = {
      slug,
      title,
      content: "",
      date: new Date().toISOString().slice(0, 10),
    };

    const local = loadLocal();
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...local, newPoem]));
    setPoems(buildMerged([...local, newPoem], loadDeleted()));
    router.push(`/writing/poems/${slug}`);
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this poem?")) return;
    const local = loadLocal().filter((p) => p.slug !== slug);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
    setPoems(buildMerged(local, loadDeleted()));
  };

  const localSlugs = new Set(
    typeof window !== "undefined" ? loadLocal().map((p) => p.slug) : []
  );

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton href="/writing" label="Back to Writing" className="mb-6" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Poems</h1>
        {editorMode && (
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add poem
          </button>
        )}
      </div>

      <div className="space-y-4">
        {poems.length === 0 ? (
          <p className="text-gray-400">No poems yet.</p>
        ) : (
          poems.map((p) => (
            <article
              key={p.slug}
              className="p-4 border border-gray-800 rounded hover:bg-gray-900"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/writing/poems/${p.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {p.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-gray-500">{p.date}</p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="text-right text-sm text-gray-400">
                    {localSlugs.has(p.slug) ? "local" : "default"}
                  </div>

                  {editorMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/writing/poems/${p.slug}`)}
                        className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug)}
                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
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
