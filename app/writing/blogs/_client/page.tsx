// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import { blogs as initialBlogs } from "@/data/writings";
import BackButton from "@/components/BackButton";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  mergeData,
  markDeleted,
} from "@/lib/localstore";

type Blog = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
};

export default function BlogsClient() {
  const router = useRouter();
  const { editorMode } = useEditor();

  const LOCAL_KEY = "blogs";
  const DELETED_KEY = "blogs_deleted";

  const [blogs, setBlogs] = useState<Blog[]>([]);

  const reloadMerged = () => {
    const local = loadFromStorage(LOCAL_KEY);
    const deleted = loadFromStorage(DELETED_KEY);
    setBlogs(mergeData(initialBlogs, local, deleted));
  };

  useEffect(() => {
    reloadMerged();
  }, []);

  const handleAddNew = () => {
    const slug = `blog-${Date.now()}`;
    const newBlog: Blog = {
      slug,
      title: "Untitled Blog",
      date: new Date().toISOString().slice(0, 10),
      content: "",
    };
    const local = loadFromStorage(LOCAL_KEY);
    saveToStorage(LOCAL_KEY, [...local, newBlog]);
    reloadMerged();
    router.push(`/writing/blogs/${slug}`);
  };

  const handleDelete = (slug: string) => {
    if (!confirm("Delete this blog?")) return;
    removeFromStorage(LOCAL_KEY, slug);
    const isDefault = (initialBlogs || []).some((b) => b.slug === slug);
    if (isDefault) markDeleted(slug, DELETED_KEY);
    reloadMerged();
  };

  return (
    <main className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <BackButton />
        {editorMode && (
          <button
            onClick={handleAddNew}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
          >
            + Add blog
          </button>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-6">Blogs</h1>

      <div className="space-y-4">
        {blogs.length === 0 ? (
          <p className="text-gray-400">No blogs yet.</p>
        ) : (
          blogs.map((b) => (
            <article
              key={b.slug}
              className="p-4 border border-gray-800 rounded hover:bg-gray-900 transition-all"
            >
              <div className="flex justify-between items-start">
                <Link
                  href={`/writing/blogs/${b.slug}`}
                  className="text-lg font-medium text-pink-400 hover:underline"
                >
                  {b.title}
                </Link>
                {editorMode && (
                  <button
                    onClick={() => handleDelete(b.slug)}
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-400 line-clamp-3">
                {(b.content || "").slice(0, 200)}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

