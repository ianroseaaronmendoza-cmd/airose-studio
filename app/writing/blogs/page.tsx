// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { blogs as initialBlogs } from "@/data/writings";

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

  const loadLocalBlogs = (): Blog[] => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Failed to parse local blogs:", e);
      return [];
    }
  };

  const loadDeletedSlugs = (): string[] => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(DELETED_KEY) : null;
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const persistLocalBlogs = (bs: Blog[]) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(bs));
    } catch (e) {
      console.warn("Failed to write blogs to localStorage:", e);
    }
  };

  const persistDeletedSlugs = (slugs: string[]) => {
    try {
      localStorage.setItem(DELETED_KEY, JSON.stringify(slugs));
    } catch (e) {
      console.warn("Failed to write deleted slugs to localStorage:", e);
    }
  };

  // Merge defaults + local (local overrides by slug), excluding deleted slugs
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

  useEffect(() => {
    const local = loadLocalBlogs();
    const deleted = loadDeletedSlugs();
    setBlogs(buildMerged(local, deleted));

    // listen to storage events so multi-tab edits reflect
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LOCAL_KEY || ev.key === DELETED_KEY) {
        const local2 = loadLocalBlogs();
        const deleted2 = loadDeletedSlugs();
        setBlogs(buildMerged(local2, deleted2));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a safe unique slug
  const makeSlug = (title = "untitled") => {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "post";
    let slug = base;
    let i = 1;
    const existing = new Set(blogs.map((b) => b.slug));
    while (existing.has(slug)) {
      slug = `${base}-${i++}`;
    }
    return slug;
  };

  // Add new blog (persist to localStorage then navigate)
  const handleAddNew = () => {
    const title = "Untitled";
    const slug = makeSlug(title + "-" + Date.now().toString().slice(-4));
    const newPost: Blog = {
      slug,
      title,
      content: "",
      date: new Date().toISOString().slice(0, 10),
    };

    // persist to localStorage
    const local = loadLocalBlogs();
    const updatedLocal = [...local, newPost];
    persistLocalBlogs(updatedLocal);

    // update UI (merge so local overrides default)
    setBlogs((prev) => {
      const map = new Map(prev.map((p) => [p.slug, p]));
      map.set(newPost.slug, newPost);
      return Array.from(map.values());
    });

    // navigate to editor for the new post
    router.push(`/writing/blogs/${slug}`);
  };

  // Delete handler: removes slug from local overrides and/or adds tombstone for defaults
  const handleDelete = (slug: string) => {
    if (!confirm("Delete this blog? This cannot be undone easily.")) return;

    // Remove from local overrides (if exists)
    const local = loadLocalBlogs();
    const updatedLocal = local.filter((b) => b.slug !== slug);
    persistLocalBlogs(updatedLocal);

    // If slug exists in defaults, add tombstone so it won't reappear
    const defaultsHave = (initialBlogs || []).some((b) => b.slug === slug);
    const deleted = loadDeletedSlugs();
    let updatedDeleted = deleted;
    if (defaultsHave && !deleted.includes(slug)) {
      updatedDeleted = [...deleted, slug];
      persistDeletedSlugs(updatedDeleted);
    }

    // Update in-memory list
    const merged = buildMerged(updatedLocal, updatedDeleted);
    setBlogs(merged);
  };

  // compute a local slug set to display local/default badge
  const localSlugs = new Set(typeof window !== "undefined" ? loadLocalBlogs().map((b) => b.slug) : []);

  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blogs</h1>

        {editorMode ? (
          <div>
            <button
              onClick={handleAddNew}
              className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              + Add blog
            </button>
          </div>
        ) : null}
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
                  <Link href={`/writing/blogs/${b.slug}`} className="text-lg font-medium hover:underline">
                    {b.title || "Untitled"}
                  </Link>
                  <p className="text-xs text-gray-500">{b.date}</p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="text-right text-sm text-gray-400">
                    {localSlugs.has(b.slug) ? "local" : "default"}
                  </div>

                  {editorMode ? (
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
                  ) : null}
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