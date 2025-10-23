"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { novels as defaultNovels } from "@/data/writings";
import { useEditor } from "@/app/layout";

type Props = { params: { novel: string } };

export default function NovelPage({ params }: Props) {
  const router = useRouter();
  const { editorMode } = useEditor();
  const { novel } = params;

  const [book, setBook] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("novels");
    const localNovels = local ? JSON.parse(local) : [];
    const allNovels = [...defaultNovels, ...localNovels];
    const found = allNovels.find((n) => n.slug === novel);
    if (found) setBook(found);
    else setNotFound(true);
  }, [novel]);

  useEffect(() => {
    if (book && editorMode) {
      const local = localStorage.getItem("novels");
      const localNovels = local ? JSON.parse(local) : [];
      const others = localNovels.filter((n: any) => n.slug !== book.slug);
      localStorage.setItem("novels", JSON.stringify([...others, book]));
    }
  }, [book, editorMode]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-400">404 — Novel Not Found</h1>
        <p className="text-gray-400 mb-6">This novel may have been deleted or renamed.</p>
        <button
          onClick={() => router.push("/writing/novels")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition"
        >
          ← Back to Novels
        </button>
      </main>
    );
  }

  if (!book) return null;

  const handleChange = (field: string, value: string) => {
    if (!editorMode) return;
    setBook({ ...book, [field]: value });
  };

  return (
    <main className="max-w-3xl mx-auto py-10">
      {editorMode ? (
        <>
          <input
            className="text-3xl font-bold mb-2 w-full bg-transparent border-b border-gray-700 focus:border-pink-400 outline-none"
            value={book.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <textarea
            className="w-full h-24 p-3 bg-gray-900 rounded-lg text-gray-100 font-light border border-gray-700 focus:border-pink-400 outline-none mb-6"
            value={book.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{book.description}</p>
        </>
      )}

      <section className="space-y-4 mb-10">
        {Array.isArray(book.chapters) && book.chapters.length > 0 ? (
          book.chapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/writing/novels/${book.slug}/${ch.slug}`}
              className="block p-4 bg-gray-800 rounded hover:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-400">Chapter {ch.number}</div>
                  <h3 className="font-semibold">{ch.title}</h3>
                </div>
                <div className="text-xs text-gray-500">Open →</div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400">No chapters yet.</p>
        )}
      </section>

      <button
        onClick={() => router.push("/writing/novels")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition"
      >
        ← Back to Novels
      </button>
    </main>
  );
}
