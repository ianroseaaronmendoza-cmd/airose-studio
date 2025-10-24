// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { poems as initialPoems } from "@/data/writings";

type Poem = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function PoemSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const [poem, setPoem] = useState<Poem | null>(null);
  const [all, setAll] = useState<Poem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const LOCAL_KEY = "poems";
  const DELETED_KEY = "poems_deleted";

  const loadLocal = (): Poem[] => {
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

  // reload merged data whenever slug changes
  useEffect(() => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    setAll(merged);
    setPoem(merged.find((p) => p.slug === slug) || null);
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

      const merged = buildMerged(updatedLocal, loadDeleted());
      setAll(merged);

      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = () => {
    if (!poem) return;
    if (!confirm("Delete this poem? This cannot be undone easily.")) return;

    const local = loadLocal();
    const updatedLocal = local.filter((p) => p.slug !== poem.slug);
    persistLocal(updatedLocal);

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
        <p className="text-gray-400">Poem not found.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700">
          ← Back
        </button>

        <div className="flex items-center space-x-2">
          {editorMode && (
            <>
              <button onClick={handleSave} disabled={saving} className={`px-3 py-2 rounded ${saving ? "bg-gray-700 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
              </button>

              <button onClick={handleDelete} className="px-3 py-2 bg-red-600 rounded hover:bg-red-700">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input className="w-full p-2 bg-gray-900 border border-gray-700 rounded" value={poem.title ?? ""} onChange={(e) => setPoem({ ...poem, title: e.target.value })} />
          <textarea className="w-full h-60 p-2 bg-gray-900 border border-gray-700 rounded" value={poem.content ?? ""} onChange={(e) => setPoem({ ...poem, content: e.target.value })} />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{poem.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{poem.date}</p>
          <article className="prose prose-invert">
            {String(poem.content ?? "").split("\n").map((line: string, i: number) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
          </article>
        </>
      )}
    </main>
  );
}