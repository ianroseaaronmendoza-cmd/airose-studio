"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { poems as defaultPoems } from "@/data/writings";
import { useEditor } from "@/app/context/EditorContext";

type Props = { params: { slug: string } };
type Poem = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function PoemSlugPage({ params }: Props) {
  const router = useRouter();
  const { editorMode } = useEditor();
  const { slug } = params;

  const [poem, setPoem] = useState<Poem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const local = typeof window !== "undefined" ? localStorage.getItem("poems") : null;
      const localPoems = local ? JSON.parse(local) : [];
      const allPoems = [...(defaultPoems ?? []), ...(localPoems ?? [])];
      const found = allPoems.find((p: Poem) => p.slug === slug);
      if (found) setPoem(found);
      else setNotFound(true);
    } catch (e) {
      console.error("Failed to load poems from localStorage:", e);
      setNotFound(true);
    }
  }, [slug]);

  useEffect(() => {
    if (!poem || !editorMode) return;
    try {
      const local = typeof window !== "undefined" ? localStorage.getItem("poems") : null;
      const localPoems = local ? JSON.parse(local) : [];
      const others = (localPoems ?? []).filter((p: Poem) => p.slug !== poem.slug);
      localStorage.setItem("poems", JSON.stringify([...others, poem]));
    } catch (e) {
      console.warn("Failed to save poem to localStorage:", e);
    }
  }, [poem, editorMode]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-400">404 — Poem Not Found</h1>
        <p className="text-gray-400 mb-6">This poem may have been deleted or renamed.</p>
        <button
          onClick={() => router.push("/writing/poems")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition"
        >
          ← Back to Poems
        </button>
      </main>
    );
  }

  if (!poem) return null;

  const handleChange = (field: keyof Poem, value: string) => {
    if (!editorMode) return;
    setPoem({ ...poem, [field]: value });
  };

  return (
    <main className="max-w-3xl mx-auto py-10">
      {editorMode ? (
        <>
          <input
            className="text-3xl font-bold mb-2 w-full bg-transparent border-b border-gray-700 focus:border-pink-400 outline-none"
            value={poem.title ?? ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <input
            className="text-xs text-gray-500 mb-6 w-full bg-transparent border-b border-gray-800 outline-none"
            value={poem.date ?? ""}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          <textarea
            className="w-full h-80 p-4 bg-gray-900 rounded-lg text-gray-100 font-light border border-gray-700 focus:border-pink-400 outline-none"
            value={poem.content ?? ""}
            onChange={(e) => handleChange("content", e.target.value)}
          />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{poem.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{poem.date}</p>
          <article className="prose prose-invert mb-10">
            {String(poem.content ?? "").split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </article>
        </>
      )}

      <button
        onClick={() => router.push("/writing/poems")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition mt-6"
      >
        ← Back to Poems
      </button>
    </main>
  );
}