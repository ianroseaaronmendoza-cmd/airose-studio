// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";

type Chapter = { slug: string; title?: string; content?: string };
type Novel = { slug: string; title?: string; chapters?: Chapter[] };

export default function ChapterPage({ params }: { params: { novel: string; chapter: string } }) {
  const { novel: novelSlug, chapter: chapterSlug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";
  const DELETED_CHAPTERS_KEY = "novels_deleted_chapters";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    const n = merged.find((x) => x.slug === novelSlug) || null;
    setNovel(n);
    setChapter(n?.chapters?.find((c) => c.slug === chapterSlug) || null);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LOCAL_KEY || ev.key === DELETED_KEY || ev.key === DELETED_CHAPTERS_KEY) {
        const local2 = loadLocal();
        const deleted2 = loadDeleted();
        const deletedChapters2 = loadDeletedChapters();
        const merged2 = buildMerged(local2, deleted2, deletedChapters2);
        const n2 = merged2.find((x) => x.slug === novelSlug) || null;
        setNovel(n2);
        setChapter(n2?.chapters?.find((c) => c.slug === chapterSlug) || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelSlug, chapterSlug]);

  if (!chapter) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <p className="text-gray-400">Chapter not found.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
          ← Back
        </button>
      </main>
    );
  }

  const handleSave = () => {
    if (!novel || !chapter) return;
    setSaving(true);
    setSaved(false);

    try {
      const local = loadLocal();
      const idx = local.findIndex((n) => n.slug === novel.slug);
      let updatedLocal = [...local];
      if (idx >= 0) {
        // update chapter in existing local override
        updatedLocal[idx] = {
          ...updatedLocal[idx],
          chapters: (updatedLocal[idx].chapters || []).map((c) => (c.slug === chapter.slug ? chapter : c)),
        };
      } else {
        // create local override from merged novel and replace chapter
        const mergedCh = (novel.chapters || []).map((c) => (c.slug === chapter.slug ? chapter : c));
        updatedLocal.push({ slug: novel.slug, title: novel.title, chapters: mergedCh });
      }
      persistLocal(updatedLocal);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!novel || !chapter) return;
    if (!confirm("Delete this chapter?")) return;

    const local = loadLocal();
    const idx = local.findIndex((n) => n.slug === novel.slug);
    if (idx >= 0) {
      local[idx] = { ...local[idx], chapters: (local[idx].chapters || []).filter((c) => c.slug !== chapter.slug) };
      persistLocal(local);
    } else {
      const deletedChapters = loadDeletedChapters();
      const arr = new Set(deletedChapters[novel.slug] || []);
      arr.add(chapter.slug);
      deletedChapters[novel.slug] = Array.from(arr);
      persistDeletedChapters(deletedChapters);
    }

    // return to novel page
    router.push(`/writing/novels/${novel.slug}`);
  };

  return (
    <main className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700">← Back</button>

        <div className="flex items-center space-x-2">
          {editorMode && (
            <>
              <button onClick={handleSave} disabled={saving} className={`px-3 py-2 rounded ${saving ? "bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
              </button>
              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 rounded hover:bg-red-700">Delete</button>
            </>
          )}
        </div>
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input value={chapter.title ?? ""} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded" />
          <textarea value={chapter.content ?? ""} onChange={(e) => setChapter({ ...chapter, content: e.target.value })} className="w-full h-72 p-2 bg-gray-900 border border-gray-700 rounded" />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
          <article className="prose prose-invert">
            {String(chapter.content ?? "").split("\n").map((line, i) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
          </article>
        </>
      )}
    </main>
  );
}