// @ts-nocheck
"use client";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@\/app\/context\/EditorContext";
import { novels as initialNovels } from "@/data/writings";
import BackButton from "@/components/BackButton";

type Chapter = { number: number; slug: string; title?: string; content?: string };
type Novel = { slug: string; title?: string; description?: string; chapters?: Chapter[] };

export default function NovelPage({ params }: { params: { novel: string } }) {
  const { novel: slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";

  const [novel, setNovel] = useState<Novel | null>(null);
  const [all, setAll] = useState<Novel[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ---- LocalStorage Helpers ----
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
    (initialNovels ?? []).forEach((n) => {
      if (!del.has(n.slug)) map.set(n.slug, n);
    });
    (local ?? []).forEach((n) => {
      if (!del.has(n.slug)) map.set(n.slug, n);
    });
    return Array.from(map.values());
  };

  // ---- Load / Merge ----
  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    setAll(merged);
    const found = merged.find((n) => n.slug === slug) || null;
    setNovel(found);
  };

  useEffect(() => {
    reloadMerged();
  }, [slug]);

  // ---- Save / Delete ----
  const handleSave = async () => {
    if (!novel) return;
    setSaving(true);
    setSaved(false);
    try {
      const local = loadLocal();
      const others = (local ?? []).filter((n) => n.slug !== novel.slug);
      const updatedLocal = [...others, novel];
      persistLocal(updatedLocal);
      setAll(buildMerged(updatedLocal, loadDeleted()));
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
    if (!novel) return;
    if (!confirm("Delete this novel?")) return;

    const local = loadLocal().filter((n) => n.slug !== novel.slug);
    persistLocal(local);

    const defaultsHave = (initialNovels || []).some((n) => n.slug === novel.slug);
    const deleted = loadDeleted();
    if (defaultsHave && !deleted.includes(novel.slug)) {
      persistDeleted([...deleted, novel.slug]);
    }

    router.push("/writing/novels");
  };

  // ---- Rendering ----
  if (!novel) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <BackButton />
        <p className="text-gray-400 mt-10">Novel not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <BackButton />
        {editorMode && (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-3 py-2 rounded ${
                saving
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
            value={novel.title ?? ""}
            onChange={(e) => setNovel({ ...novel, title: e.target.value })}
            placeholder="Novel title"
          />
          <textarea
            className="w-full h-32 p-2 bg-gray-900 border border-gray-700 rounded"
            value={novel.description ?? ""}
            onChange={(e) => setNovel({ ...novel, description: e.target.value })}
            placeholder="Novel description..."
          />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-pink-400">{novel.title}</h1>
          <p className="text-gray-300">{novel.description}</p>
          <h2 className="mt-8 text-xl font-semibold">Chapters</h2>
          <div className="space-y-2 mt-4">
            {(novel.chapters ?? []).map((ch) => (
              <div key={ch.slug}>
                <a
                  href={`/writing/novels/${novel.slug}/${ch.slug}`}
                  className="block p-3 rounded border border-gray-800 hover:bg-gray-900 hover:text-pink-400 transition"
                >
                  {ch.title || `Chapter ${ch.number}`}
                </a>
              </div>
            ))}
            {(!novel.chapters || novel.chapters.length === 0) && (
              <p className="text-sm text-gray-500">No chapters yet.</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
