"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { novels as defaultNovels } from "@/data/writings";
import { useEditor } from "@/app/layout";

type Props = { params: { novel: string; chapter: string } };

export default function ChapterPage({ params }: Props) {
  const router = useRouter();
  const { editorMode } = useEditor();
  const { novel, chapter } = params;

  const [book, setBook] = useState<any>(null);
  const [chapterData, setChapterData] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Load from default + localStorage
  useEffect(() => {
    const local = localStorage.getItem("novels");
    const localNovels = local ? JSON.parse(local) : [];
    const allNovels = [...defaultNovels, ...localNovels];
    const foundBook = allNovels.find((n) => n.slug === novel);

    if (!foundBook) {
      setNotFound(true);
      return;
    }

    setBook(foundBook);
    const chapters = Array.isArray(foundBook.chapters) ? foundBook.chapters : [];
    const foundChapter = chapters.find((c) => c.slug === chapter);
    if (foundChapter) setChapterData(foundChapter);
    else setNotFound(true);
  }, [novel, chapter]);

  // Auto-save edits to localStorage
  useEffect(() => {
    if (!book || !chapterData || !editorMode) return;

    const local = localStorage.getItem("novels");
    const localNovels = local ? JSON.parse(local) : [];
    const others = localNovels.filter((n: any) => n.slug !== book.slug);

    // Replace chapter in this book
    const updatedChapters = book.chapters.map((c: any) =>
      c.slug === chapterData.slug ? chapterData : c
    );
    const updatedBook = { ...book, chapters: updatedChapters };

    localStorage.setItem("novels", JSON.stringify([...others, updatedBook]));
  }, [book, chapterData, editorMode]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-400">404 — Chapter Not Found</h1>
        <p className="text-gray-400 mb-6">
          This chapter may have been deleted or renamed.
        </p>
        <button
          onClick={() => router.push(`/writing/novels/${novel}`)}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition"
        >
          ← Back to Novel
        </button>
      </main>
    );
  }

  if (!chapterData || !book) return null;

  const handleChange = (field: string, value: string) => {
    if (!editorMode) return;
    setChapterData({ ...chapterData, [field]: value });
  };

  const chapters = book.chapters || [];
  const currentIndex = chapters.findIndex((c: any) => c.slug === chapter);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <main className="max-w-3xl mx-auto py-10">
      <header className="mb-6">
        <Link
          href={`/writing/novels/${book.slug}`}
          className="text-sm text-pink-400 hover:underline"
        >
          ← Back to {book.title}
        </Link>

        {editorMode ? (
          <>
            <input
              className="text-3xl font-bold mt-2 mb-1 w-full bg-transparent border-b border-gray-700 focus:border-pink-400 outline-none"
              value={chapterData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            <input
              className="text-xs text-gray-500 w-full bg-transparent border-b border-gray-800 outline-none"
              value={chapterData.number}
              onChange={(e) => handleChange("number", e.target.value)}
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mt-2 mb-1">{chapterData.title}</h1>
            <p className="text-xs text-gray-500 mb-4">
              Chapter {chapterData.number}
            </p>
          </>
        )}
      </header>

      {editorMode ? (
        <textarea
          className="w-full h-[400px] p-4 bg-gray-900 rounded-lg text-gray-100 font-light border border-gray-700 focus:border-pink-400 outline-none mb-8"
          value={chapterData.content}
          onChange={(e) => handleChange("content", e.target.value)}
        />
      ) : (
        <article className="prose prose-invert mb-8">
          {chapterData.content.split("\n").map((line: string, i: number) =>
            line.trim() ? <p key={i}>{line}</p> : <br key={i} />
          )}
        </article>
      )}

      {/* Navigation */}
      <nav className="flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/writing/novels/${book.slug}/${prev.slug}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
          >
            ← {prev.title}
          </Link>
        ) : (
          <div className="px-4 py-2 opacity-50">Beginning</div>
        )}

        <div className="text-sm text-gray-400 self-center">
          {currentIndex + 1} / {chapters.length}
        </div>

        {next ? (
          <Link
            href={`/writing/novels/${book.slug}/${next.slug}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
          >
            {next.title} →
          </Link>
        ) : (
          <div className="px-4 py-2 opacity-50">End</div>
        )}
      </nav>
    </main>
  );
}
