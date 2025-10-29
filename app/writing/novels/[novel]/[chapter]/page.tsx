// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";
import BackButton from "@/app/components/BackButton";

type Chapter = { number: number; slug: string; title?: string; content?: string };
type Book = { slug: string; title?: string; description?: string; chapters?: Chapter[] };

export default function ChapterPage({ params }: { params: { novel: string; chapter: string } }) {
  const { novel, chapter } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "novels";
  const DELETED_KEY = "novels_deleted";

  const loadLocal = (): Book[] => {
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

  const persistLocal = (items: Book[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  };

  const buildMerged = (local: Book[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Book>();
    (initialNovels ?? []).forEach((b: Book) => {
      if (!del.has(b.slug)) map.set(b.slug, b);
    });
    (local ?? []).forEach((b: Book) => {
      if (!del.has(b.slug)) map.set(b.slug, b);
    });
    return Array.from(map.values());
  };

  const [book, setBook] = useState<Book | null>(null);
  const [chap, setChap] = useState<Chapter | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    const found = merged.find((b) => b.slug === novel) || null;
    setBook(found);
    const foundChap = found?.chapters?.find((c) => c.slug === chapter) || null;
    setChap(foundChap);
  };

  useEffect(() => {
    reloadMerged();
  }, [novel, chapter]);

  const handleSave = async () => {
    if (!chap || !book) return;
    setSaving(true);
    setSaved(false);
    try {
      const local = loadLocal();
      const others = (local ?? []).filter((b) => b.slug !== book.slug);
      const updatedBook: Book = {
        ...book,
        chapters: (book.chapters ?? []).map((c) => (c.slug === chap.slug ? chap : c)),
      };
      persistLocal([...others, updatedBook]);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      reloadMerged();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = () => {
    if (!book || !chap) return;
    if (!confirm("Delete this chapter?")) return;

    const local = loadLocal();
    const others = (local ?? []).filter((b) => b.slug !== book.slug);
    const updatedBook: Book = {
      ...book,
      chapters: (book.chapters ?? []).filter((c) => c.slug !== chap.slug).map((c, i) => ({ ...c, number: i + 1 })),
    };
    persistLocal([...others, updatedBook]);
    router.push(`/writing/novels/${book.slug}`);
  };

  if (!book || !chap) {
    return (
      <main className="max-w-4xl mx-auto py-10 text-center">
        <BackButton href={`/writing/novels/${novel}`} />
        <p className="text-gray-400 mt-6">Chapter not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton href={`/writing/novels/${novel}`} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{chap.title || `Chapter ${chap.number}`}</h1>
          <p className="text-xs text-gray-500">Book: {book.title}</p>
        </div>

        {editorMode && (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className={`px-3 py-2 rounded ${saving ? "bg-gray-700" : "bg-green-600 hover:bg-green-700"}`}>
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </button>
            <button onClick={handleDeleteChapter} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700">Delete</button>
          </div>
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input value={chap.title ?? ""} onChange={(e) => setChap({ ...chap, title: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded" placeholder="Chapter title" />
          <textarea value={chap.content ?? ""} onChange={(e) => setChap({ ...chap, content: e.target.value })} className="w-full h-72 p-2 bg-gray-900 border border-gray-700 rounded" placeholder="Chapter content" />
        </div>
      ) : (
        <article className="prose prose-invert">
          {String(chap.content ?? "").split("\n").map((line: string, i: number) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
        </article>
      )}
    </main>
  );
}
