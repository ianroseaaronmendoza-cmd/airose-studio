// @ts-nocheck
"use client";

// ✅ Force this route to always run dynamically on the server (no static build)
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { blogs as initialBlogs } from "@/data/writings";
import BackButton from "@/components/BackButton";

type Blog = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function BlogsListPage() {
  const router = useRouter();
  const { editorMode } = useEditor();
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const LOCAL_KEY = "blogs";
  const DELETED_KEY = "blogs_deleted";

  // ---- Local Storage Helpers ----
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

  // ---- Initial Load ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reload = () => {
      const local = loadLocal();
      const deleted = loadDeleted();
      setBlogs(buildMerged(local, deleted));
    };

    reload();

    // Sync across tabs
    const onStorage = (ev: StorageEvent) => {
      if (!ev.key || ev.key.startsWith(LOCAL_KEY) || ev.key.startsWith(DELETED_KEY)) {
        reload();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ---- Create New ----
  const makeSlug = (title = "untitled") => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "post";
    let slug = base;
    let i = 1;
    const existing = new Set(blogs.map((b) => b.slug));
    while (existing.has(slug)) slug = `${base}-${i++}`;
    return slug;
  };

  const handleAddNew = () => {
    const title = "Untitled";
    const slug = makeSlug(title + "-" + Date.now().toString().slice(-4));
    const newPost: Blog = {
      slug,
      title,
      content: "",
      date: new Date().toISOString().slice(0, 10),
    };

    const local = loadLocal();
    const updatedLocal = [...local, newPost];
    persistLocal(updatedLocal);
    setBlogs(buildMerged(updatedLocal, loadDeleted()));

    router.push(`/writing/blogs/${slug}`);
  };

  // ---- Delete ----
  const handleDelete = (slug: string) => {
    if (!confirm("Delete this blog? This cannot be undone easily.")) return;

    const local = loadLocal();
    const updatedLocal = local.filter((b) => b.slug !== slug);
    persistLocal(updatedLocal);

    const defaultsHave = (initialBlogs || []).some((b) => b.slug === slug);
    const deleted = loadDeleted();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(slug)) {
      updatedDeleted = [...deleted, slug];
      persistDeleted(updatedDeleted);
    }

    setBlogs(buildMerged(updatedLocal, updatedDeleted));
  };

  const localSlugs = new Set(
    typeof window !== "undefined" ? loadLocal().map((b) => b.slug) : []
  );

  // ---- Render ----
  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton href="/writing" label="Back to Writing" className="mb-6" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blogs</h1>
        {editorMode && (
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add blog
          </button>
        )}
      </div>

      <div className="space-y-4">
        {blogs.length === 0 ? (
          <p className="text-gray-400">No blogs yet.</p>
        ) : (
          blogs.map((b) => (
            <article
              key={b.slug}
              className="p-4 border border-gray-800 rounded hover:bg-gray-900"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/writing/blogs/${b.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {b.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-gray-500">{b.date}</p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="text-right text-sm text-gray-400">
                    {localSlugs.has(b.slug) ? "local" : "default"}
                  </div>

                  {editorMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/writing/blogs/${b.slug}`)}
                        className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.slug)}
                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-300 line-clamp-3">
                {(b.content || "").slice(0, 250)}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
