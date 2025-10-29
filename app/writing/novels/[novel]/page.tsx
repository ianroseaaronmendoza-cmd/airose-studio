// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";
import BackButton from "@/components/BackButton";

type Chapter = { slug: string; title?: string; content?: string };
type Novel = { slug: string; title?: string; chapters?: Chapter[] };

export default function NovelPage({ params }: { params: { novel: string } }) {
  const { novel: novelSlug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const [novel, setNovel] = useState<Novel | null>(null);
  const [all, setAll] = useState<Novel[]>([]);
  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";
  const DELETED_CHAPTERS_KEY = "novels_deleted_chapters";

  const loadLocal = (): Novel[] => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
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

  const loadDeletedChapters = (): Record<string, string[]> => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(DELETED_CHAPTERS_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
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

  const persistDeletedChapters = (map: Record<string, string[]>) => {
    try {
      localStorage.setItem(DELETED_CHAPTERS_KEY, JSON.stringify(map));
    } catch {}
  };

  const buildMerged = (local: Novel[], deleted: string[], deletedChaptersMap: Record<string, string[]>) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Novel>();
    (initialNovels ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) {
        const defCh = (n.chapters ?? []).filter((c) => {
          const delCh = deletedChaptersMap[n.slug] || [];
          return !delCh.includes(c.slug);
        });
        map.set(n.slug, { ...n, chapters: defCh });
      }
    });
    (local ?? []).forEach((n: Novel) => {
      if (!del.has(n.slug)) {
        // overlay local chapters, local replaces by slug
        const existing = map.get(n.slug) || { slug: n.slug, title: n.title, chapters: [] };
        const chapMap = new Map<string, Chapter>();
        (existing.chapters || []).forEach((c: Chapter) => chapMap.set(c.slug, c));
        (n.chapters || []).forEach((c: Chapter) => chapMap.set(c.slug, c));
        map.set(n.slug, { ...existing, ...n, chapters: Array.from(chapMap.values()) });
      }
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const deletedChapters = loadDeletedChapters();
    const merged = buildMerged(local, deleted, deletedChapters);
    setAll(merged);
    setNovel(merged.find((n) => n.slug === novelSlug) || null);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LOCAL_KEY || ev.key === DELETED_KEY || ev.key === DELETED_CHAPTERS_KEY) {
        const local2 = loadLocal();
        const deleted2 = loadDeleted();
        const deletedChapters2 = loadDeletedChapters();
        const merged2 = buildMerged(local2, deleted2, deletedChapters2);
        setAll(merged2);
        setNovel(merged2.find((n) => n.slug === novelSlug) || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelSlug]);

  // create chapter slug unique within novel
  const makeChapterSlug = (title = "chapter") => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "ch";
    let slug = base;
    let i = 1;
    const existing = new Set((novel?.chapters || []).map((c) => c.slug));
    while (existing.has(slug)) slug = `${base}-${i++}`;
    return slug;
  };

  const handleAddChapter = () => {
    if (!novel) return;
    const title = "Untitled Chapter";
    const slug = makeChapterSlug(title + "-" + Date.now().toString().slice(-4));
    const newChapter: Chapter = { slug, title, content: "" };

    // save into local novels (append chapter to existing local override or create one)
    const local = loadLocal();
    const idx = local.findIndex((n) => n.slug === novel.slug);
    let updatedLocal = [...local];
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], chapters: [...(updatedLocal[idx].chapters || []), newChapter] };
    } else {
      // create local override based on merged novel and add chapter
      updatedLocal.push({ slug: novel.slug, title: novel.title, chapters: [...(novel.chapters || []), newChapter] });
    }
    persistLocal(updatedLocal);

    // update view immediately
    const deleted = loadDeleted();
    const deletedChapters = loadDeletedChapters();
    const merged = buildMerged(updatedLocal, deleted, deletedChapters);
    setAll(merged);
    setNovel(merged.find((n) => n.slug === novel.slug) || null);

    router.push(`/writing/novels/${novel.slug}/${slug}`);
  };

  const handleDeleteNovel = () => {
    if (!novel) return;
    if (!confirm("Delete this novel? This hides default novels or removes local ones.")) return;

    const local = loadLocal();
    const updatedLocal = local.filter((n) => n.slug !== novel.slug);
    persistLocal(updatedLocal);

    const defaultsHave = (initialNovels || []).some((n) => n.slug === novel.slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(novel.slug)) {
      updatedDeleted = [...deleted, novel.slug];
      persistDeleted(updatedDeleted);
    }

    router.push("/writing/novels");
  };

  const handleDeleteChapter = (chapterSlug: string) => {
    if (!novel) return;
    if (!confirm("Delete this chapter?")) return;

    // remove from local override if exists
    const local = loadLocal();
    const idx = local.findIndex((n) => n.slug === novel.slug);
    let updatedLocal = [...local];
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], chapters: (updatedLocal[idx].chapters || []).filter((c) => c.slug !== chapterSlug) };
      persistLocal(updatedLocal);
    } else {
      // add tombstone for this chapter under DELETED_CHAPTERS_KEY
      const deletedChapters = loadDeletedChapters();
      const arr = new Set(deletedChapters[novel.slug] || []);
      arr.add(chapterSlug);
      deletedChapters[novel.slug] = Array.from(arr);
      persistDeletedChapters(deletedChapters);
    }

    const deleted = loadDeleted();
    const deletedChapters2 = loadDeletedChapters();
    const merged = buildMerged(updatedLocal, deleted, deletedChapters2);
    setAll(merged);
    setNovel(merged.find((n) => n.slug === novel.slug) || null);
  };

  if (!novel) {
    return (
      <main className="max-w-4xl mx-auto py-10 text-center">
        <p className="text-gray-400">Novel not found.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton href="/writing/novels" className="mb-4" />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{novel.title}</h1>
          <p className="text-xs text-gray-500">{(novel.chapters || []).length} chapters</p>
        </div>

        <div className="flex items-center space-x-2">
          {editorMode && (
            <>
              <button onClick={handleAddChapter} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">+ Add chapter</button>
              <button onClick={handleDeleteNovel} className="px-3 py-2 bg-red-600 rounded hover:bg-red-700">Delete novel</button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {(novel.chapters || []).map((c) => (
          <div key={c.slug} className="p-3 border border-gray-800 rounded flex justify-between items-start">
            <div>
              <Link href={`/writing/novels/${novel.slug}/${c.slug}`} className="font-medium hover:underline">{c.title || "Untitled Chapter"}</Link>
              <p className="text-xs text-gray-500">{(c.content || "").slice(0, 120)}</p>
            </div>

            {editorMode && (
              <div className="flex space-x-2">
                <button onClick={() => router.push(`/writing/novels/${novel.slug}/${c.slug}`)} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">Edit</button>
                <button onClick={() => handleDeleteChapter(c.slug)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}