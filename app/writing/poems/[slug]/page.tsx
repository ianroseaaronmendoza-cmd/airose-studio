// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { poems as initialPoems } from "@/data/writings";
import BackButton from "@/app/components/BackButton";

type Poem = { slug: string; title?: string; date?: string; content?: string };

export default function PoemSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "poems";
  const DELETED_KEY = "poems_deleted";

  const loadLocal = (): Poem[] => {
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

  const persistLocal = (items: Poem[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  };

  const persistDeleted = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
    } catch {}
  };

  const buildMerged = (local: Poem[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Poem>();
    (initialPoems ?? []).forEach((p: Poem) => {
      if (!del.has(p.slug)) map.set(p.slug, p);
    });
    (local ?? []).forEach((p: Poem) => {
      if (!del.has(p.slug)) map.set(p.slug, p);
    });
    return Array.from(map.values());
  };

  const [poem, setPoem] = useState<Poem | null>(null);
  const [all, setAll] = useState<Poem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    setAll(merged);
    const found = merged.find((p) => p.slug === slug) || null;
    setPoem(found);
  };

  useEffect(() => {
    reloadMerged();
  }, [slug]);

  async function handleSave() {
    if (!poem) return;
    setSaving(true);
    setSaved(false);
    try {
      const local = loadLocal();
      const others = (local ?? []).filter((p) => p.slug !== poem.slug);
      const updatedLocal = [...others, poem];
      persistLocal(updatedLocal);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      reloadMerged();
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = () => {
    if (!poem) return;
    if (!confirm("Delete this poem?")) return;

    // Remove from local storage
    const local = loadLocal().filter((p) => p.slug !== poem.slug);
    persistLocal(local);

    // If the poem exists in defaults, mark it deleted so merged results hide it
    const defaultsHave = (initialPoems || []).some((p) => p.slug === poem.slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(poem.slug)) {
      updatedDeleted = [...deleted, poem.slug];
      persistDeleted(updatedDeleted);
    }

    router.push("/writing/poems");
  };

  if (!poem) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <BackButton href="/writing/poems" />
        <p className="text-gray-400 mt-6">Poem not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10">
      <BackButton href="/writing/poems" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{poem.title || "Untitled"}</h1>

        {editorMode && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-3 py-2 rounded ${saving ? "bg-gray-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </button>
            <button onClick={handleDelete} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700">
              Delete
            </button>
          </div>
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input
            value={poem.title ?? ""}
            onChange={(e) => setPoem({ ...poem, title: e.target.value })}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
            placeholder="Title"
          />
          <textarea
            value={poem.content ?? ""}
            onChange={(e) => setPoem({ ...poem, content: e.target.value })}
            className="w-full h-64 p-2 bg-gray-900 border border-gray-700 rounded"
            placeholder="Content"
          />
        </div>
      ) : (
        <>
          {poem.date && <p className="text-xs text-gray-500 mb-4">{poem.date}</p>}
          <article className="prose prose-invert">
            {String(poem.content ?? "")
              .split("\n")
              .map((line: string, i: number) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
          </article>
        </>
      )}
    </main>
  );
}
