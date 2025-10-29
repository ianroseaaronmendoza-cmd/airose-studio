// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { blogs as initialBlogs } from "@/data/writings";
import BackButton from "@/app/components/BackButton";

type Blog = { slug: string; title?: string; date?: string; excerpt?: string; content?: string };

export default function BlogSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "blogs";
  const DELETED_KEY = "blogs_deleted";

  const loadLocal = (): Blog[] => {
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

  const persistLocal = (items: Blog[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {}
  };

  const persistDeleted = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
    } catch {}
  };

  const buildMerged = (local: Blog[], deleted: string[]) => {
    const del = new Set(deleted || []);
    const map = new Map<string, Blog>();
    (initialBlogs ?? []).forEach((b: Blog) => {
      if (!del.has(b.slug)) map.set(b.slug, b);
    });
    (local ?? []).forEach((b: Blog) => {
      if (!del.has(b.slug)) map.set(b.slug, b);
    });
    return Array.from(map.values());
  };

  const [post, setPost] = useState<Blog | null>(null);
  const [all, setAll] = useState<Blog[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const reloadMerged = () => {
    const local = loadLocal();
    const deleted = loadDeleted();
    const merged = buildMerged(local, deleted);
    setAll(merged);
    const found = merged.find((p) => p.slug === slug) || null;
    setPost(found);
  };

  useEffect(() => {
    reloadMerged();
  }, [slug]);

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setSaved(false);
    try {
      const local = loadLocal();
      const others = (local ?? []).filter((p) => p.slug !== post.slug);
      const updatedLocal = [...others, post];
      persistLocal(updatedLocal);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      reloadMerged();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = () => {
    if (!post) return;
    if (!confirm("Delete this blog?")) return;

    const local = loadLocal().filter((p) => p.slug !== post.slug);
    persistLocal(local);

    const defaultsHave = (initialBlogs || []).some((p) => p.slug === post.slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(post.slug)) {
      updatedDeleted = [...deleted, post.slug];
      persistDeleted(updatedDeleted);
    }

    router.push("/writing/blogs");
  };

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <BackButton href="/writing/blogs" />
        <p className="text-gray-400 mt-6">Blog post not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10">
      <BackButton href="/writing/blogs" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{post.title || "Untitled"}</h1>

        {editorMode && (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className={`px-3 py-2 rounded ${saving ? "bg-gray-700" : "bg-green-600 hover:bg-green-700"}`}>
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
            </button>
            <button onClick={handleDelete} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700">Delete</button>
          </div>
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input value={post.title ?? ""} onChange={(e) => setPost({ ...post, title: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded" placeholder="Title" />
          <input value={post.date ?? ""} onChange={(e) => setPost({ ...post, date: e.target.value })} className="w-full p-2 bg-gray-900 border border-gray-700 rounded" placeholder="Date (YYYY-MM-DD)" />
          <textarea value={post.content ?? ""} onChange={(e) => setPost({ ...post, content: e.target.value })} className="w-full h-64 p-2 bg-gray-900 border border-gray-700 rounded" placeholder="Content" />
        </div>
      ) : (
        <>
          {post.date && <p className="text-xs text-gray-500 mb-4">{post.date}</p>}
          <article className="prose prose-invert">
            {String(post.content ?? "").split("\n").map((line: string, i: number) => (line.trim() ? <p key={i}>{line}</p> : <br key={i} />))}
          </article>
        </>
      )}
    </main>
  );
}
