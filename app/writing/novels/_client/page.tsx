// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";
import BackButton from "@/app/components/BackButton";

type Chapter = { number: number; slug: string; title?: string; content?: string };
type Novel = { slug: string; title?: string; description?: string; chapters?: Chapter[] };

export default function NovelsClient() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";

  const [novels, setNovels] = useState<Novel[]>([]);

  const loadLocal = (): Novel[] => {
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

  const persistLocal = (items: Novel[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  };

  const persistDeleted = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
    } catch {}
  };

  const buildMerged = (local: Novel[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Novel>();
    (initialNovels ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) map.set(n.slug, n);
    });
    (local ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) map.set(n.slug, n);
    });
    return Array.from(map.values());
  };

  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    setNovels(buildMerged(local, deleted));
  };

  useEffect(() => {
    reloadMerged();
  }, []);

  const makeSlug = (title = "untitled") => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${base}-${Date.now()}`;
  };

  const handleAddNew = () => {
    const title = "Untitled Novel";
    const slug = makeSlug(title);
    const newNovel: Novel = {
      slug,
      title,
      description: "New story description...",
      chapters: [],
    };

    const local = loadLocal();
    persistLocal([...local, newNovel]);
    reloadMerged();
    router.push(`/writing/novels/${slug}`);
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this novel?")) return;
    const local = loadLocal().filter((n) => n.slug !== slug);
    persistLocal(local);

    const defaultsHave = (initialNovels || []).some((n) => n.slug === slug);
    const deleted = loadDeleted();
    if (defaultsHave && !deleted.includes(slug)) {
      persistDeleted([...deleted, slug]);
    }

    reloadMerged();
  };

  const localSlugs = new Set(
    typeof window !== "undefined" ? loadLocal().map((n) => n.slug) : []
  );

  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        {editorMode && (
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add Novel
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-6">Novels</h1>

      <div className="space-y-4">
        {novels.length === 0 ? (
          <p className="text-gray-400">No novels yet.</p>
        ) : (
          novels.map((n) => (
            <article
              key={n.slug}
              className="p-4 border border-gray-800 rounded hover:bg-gray-900 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/writing/novels/${n.slug}`}
                    className="text-lg font-medium text-pink-400 hover:underline"
                  >
                    {n.title}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {n.chapters?.length || 0}{" "}
                    {n.chapters?.length === 1 ? "chapter" : "chapters"}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className="text-sm text-gray-400">
                    {localSlugs.has(n.slug) ? "local" : "default"}
                  </span>

                  {editorMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/writing/novels/${n.slug}`)}
                        className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(n.slug)}
                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                {n.description || ""}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
