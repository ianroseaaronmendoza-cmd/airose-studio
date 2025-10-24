// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";

type Chapter = { slug: string; title?: string; content?: string };
type Novel = { slug: string; title?: string; chapters?: Chapter[] };

export default function NovelsListPage() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const [novels, setNovels] = useState<Novel[]>([]);

  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";

  const loadLocal = (): Novel[] => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse local novels:", e);
      return [];
    }
  };

  const loadDeleted = (): string[] => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(DELETED_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const persistLocal = (items: Novel[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write novels to localStorage:", e);
    }
  };

  const persistDeleted = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
    } catch (e) {
      console.warn("Failed to write novels_deleted:", e);
    }
  };

  // Merge defaults + local (local overrides by slug), excluding deleted novels
  const buildMerged = (local: Novel[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Novel>();
    (initialNovels ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) map.set(n.slug, { ...n, chapters: n.chapters ?? [] });
    });
    (local ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) map.set(n.slug, { ...map.get(n.slug), ...n });
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const local = loadLocal();
    const deleted = loadDeleted();
    setNovels(buildMerged(local, deleted));

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LOCAL_KEY || ev.key === DELETED_KEY) {
        const local2 = loadLocal();
        const deleted2 = loadDeleted();
        setNovels(buildMerged(local2, deleted2));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeSlug = (title = "untitled") => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "novel";
    let slug = base;
    let i = 1;
    const existing = new Set(novels.map((n) => n.slug));
    while (existing.has(slug)) slug = `${base}-${i++}`;
    return slug;
  };

  const handleAddNovel = () => {
    const title = "Untitled Novel";
    const slug = makeSlug(title + "-" + Date.now().toString().slice(-4));
    const newNovel: Novel = { slug, title, chapters: [] };

    const local = loadLocal();
    const updatedLocal = [...local, newNovel];
    persistLocal(updatedLocal);

    setNovels((prev) => {
      const map = new Map(prev.map((p) => [p.slug, p]));
      map.set(newNovel.slug, newNovel);
      return Array.from(map.values());
    });

    router.push(`/writing/novels/${slug}`);
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this novel? This will remove local copy and hide default.")) return;

    // Remove local override if any
    const local = loadLocal();
    const updatedLocal = local.filter((n) => n.slug !== slug);
    persistLocal(updatedLocal);

    // If it exists in defaults, add tombstone
    const defaultsHave = (initialNovels || []).some((n) => n.slug === slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(slug)) {
      updatedDeleted = [...deleted, slug];
      persistDeleted(updatedDeleted);
    }

    setNovels(buildMerged(updatedLocal, updatedDeleted));
  };

  const localSlugs = new Set(typeof window !== "undefined" ? loadLocal().map((n) => n.slug) : []);

  return (
    <main className="max-w-5xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Novels</h1>
        {editorMode && (
          <button onClick={handleAddNovel} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">
            + Add novel
          </button>
        )}
      </div>

      <div className="space-y-4">
        {novels.length === 0 ? (
          <p className="text-gray-400">No novels yet.</p>
        ) : (
          novels.map((n) => (
            <article key={n.slug} className="p-4 border border-gray-800 rounded hover:bg-gray-900">
              <div className="flex justify-between items-start">
                <div>
                  <Link href={`/writing/novels/${n.slug}`} className="text-lg font-medium hover:underline">
                    {n.title || "Untitled Novel"}
                  </Link>
                  <p className="text-xs text-gray-500">{(n.chapters || []).length} chapters</p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right text-sm text-gray-400">{localSlugs.has(n.slug) ? "local" : "default"}</div>
                  {editorMode && (
                    <div className="flex space-x-2">
                      <button onClick={() => router.push(`/writing/novels/${n.slug}`)} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">
                        Open
                      </button>
                      <button onClick={() => handleDelete(n.slug)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}