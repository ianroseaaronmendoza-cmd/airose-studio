// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { novels as initialNovels } from "@/data/writings";
import BackButton from "@/components/BackButton";

type Chapter = { number: number; slug: string; title?: string; content?: string };
type Book = { slug: string; title?: string; description?: string; chapters?: Chapter[] };

export default function NovelPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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

  const persistDeleted = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
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
  const [all, setAll] = useState<Book[]>([]);
  const [saving, setSaving] = useState(false);

  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    setAll(merged);
    const found = merged.find((b) => b.slug === slug) || null;
    setBook(found);
  };

  useEffect(() => {
    reloadMerged();
  }, [slug]);

  const handleAddChapter = () => {
    if (!book) return;
    const newIndex = (book.chapters?.length ?? 0) + 1;
    const slugBase = `chapter-${newIndex}-${Date.now().toString().slice(-4)}`;
    const newChapter: Chapter = { number: newIndex, slug: slugBase, title: `Chapter ${newIndex}`, content: "" };

    const local = loadLocal();
    const others = (local ?? []).filter((b) => b.slug !== book.slug);
    const updatedBook: Book = { ...book, chapters: [...(book.chapters ?? []), newChapter] };
    const updatedLocal = [...others, updatedBook];
    persistLocal(updatedLocal);
    reloadMerged();
    router.push(`/writing/novels/${book.slug}/${newChapter.slug}`);
  };

  const handleDeleteBook = () => {
    if (!book) return;
    if (!confirm("Delete this book?")) return;

    const local = loadLocal().filter((b) => b.slug !== book.slug);
    persistLocal(local);

    const defaultsHave = (initialNovels || []).some((p) => p.slug === book.slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(book.slug)) {
      updatedDeleted = [...deleted, book.slug];
      persistDeleted(updatedDeleted);
    }

    router.push("/writing/novels");
  };

  const handleSaveMeta = async (title?: string, description?: string) => {
    if (!book) return;
    setSaving(true);
    const local = loadLocal();
    const others = (local ?? []).filter((b) => b.slug !== book.slug);
    const updatedBook = { ...book, title: title ?? book.title, description: description ?? book.description };
    persistLocal([...others, updatedBook]);
    reloadMerged();
    setSaving(false);
  };

  if (!book) {
    return (
      <main className="max-w-4xl mx-auto py-10 text-center">
        <BackButton href="/writing/novels" />
        <p className="text-gray-400 mt-6">Novel not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton href="/writing/novels" />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>
          {book.description && <p className="text-gray-400 mt-1">{book.description}</p>}
        </div>

        <div className="flex gap-2">
          {editorMode && (
            <>
              <button onClick={handleAddChapter} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">+ Add chapter</button>
              <button onClick={() => handleSaveMeta(book.title, book.description)} disabled={saving} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">{saving ? "Saving..." : "Save"}</button>
              <button onClick={handleDeleteBook} className="px-3 py-2 bg-red-600 rounded hover:bg-red-700">Delete Book</button>
            </>
          )}
        </div>
      </div>

      <section className="space-y-4">
        {Array.isArray(book.chapters) && book.chapters.length > 0 ? (
          book.chapters.map((ch) => (
            <Link key={ch.slug} href={`/writing/novels/${book.slug}/${ch.slug}`} className="block p-4 border border-gray-800 rounded hover:bg-gray-900">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-400">Chapter {ch.number}</div>
                  <h3 className="font-semibold">{ch.title}</h3>
                </div>
                <div className="text-xs text-gray-400">Open →</div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No chapters yet.</p>
        )}
      </section>
    </main>
  );
}

