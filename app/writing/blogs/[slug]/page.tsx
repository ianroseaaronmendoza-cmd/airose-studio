// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { blogs as initialBlogs } from "@/data/writings";

export const dynamic = "force-dynamic"; // ✅ Tells Vercel this route is dynamic

type Blog = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function BlogSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor();

  const [post, setPost] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const LOCAL_KEY = "blogs";

  const loadLocalBlogs = (): Blog[] => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse local blogs:", e);
      return [];
    }
  };

  const persistLocalBlogs = (blogs: Blog[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(blogs));
    } catch (e) {
      console.warn("Failed to write blogs to localStorage:", e);
    }
  };

  // Initialize merged blog list (local edits override defaults)
  useEffect(() => {
    try {
      const local = loadLocalBlogs();
      const map = new Map<string, Blog>();
      (initialBlogs ?? []).forEach((b: Blog) => map.set(b.slug, b));
      (local ?? []).forEach((b: Blog) => map.set(b.slug, b));
      const merged = Array.from(map.values());
      setAllBlogs(merged);
      const found = merged.find((b) => b.slug === slug) || null;
      setPost(found);
    } catch (e) {
      console.error("Failed to load blogs:", e);
      setAllBlogs(initialBlogs ?? []);
      setPost(
        (initialBlogs ?? []).find((b) => b.slug === slug) ?? null
      );
    }
  }, [slug]);

  // Keep post in sync if allBlogs changes (e.g. after a save)
  useEffect(() => {
    if (!allBlogs || allBlogs.length === 0) return;
    const found = allBlogs.find((b) => b.slug === slug) || null;
    setPost(found);
  }, [allBlogs, slug]);

  // Save edited post to localStorage (explicit save button)
  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setSaved(false);

    try {
      const local = loadLocalBlogs();
      const others = (local ?? []).filter((b: Blog) => b.slug !== post.slug);
      const updatedLocal = [...others, post];
      persistLocalBlogs(updatedLocal);

      const defaultMap = new Map<string, Blog>();
      (initialBlogs ?? []).forEach((b: Blog) => defaultMap.set(b.slug, b));
      (updatedLocal ?? []).forEach((b: Blog) => defaultMap.set(b.slug, b));
      const merged = Array.from(defaultMap.values());
      setAllBlogs(merged);

      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <p className="text-gray-400">Post not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ← Back
        </button>

        {editorMode && (
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
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
            value={post.title ?? ""}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
          <textarea
            className="w-full h-60 p-2 bg-gray-900 border border-gray-700 rounded"
            value={post.content ?? ""}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
          />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{post.date}</p>
          <article className="prose prose-invert">
            {String(post.content ?? "")
              .split("\n")
              .map((line: string, i: number) =>
                line.trim() ? <p key={i}>{line}</p> : <br key={i} />
              )}
          </article>
        </>
      )}
    </main>
  );
}
