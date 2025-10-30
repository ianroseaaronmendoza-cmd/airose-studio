"use client";

import React, { useEffect, useState } from "react";
import { useEditor } from "@\/app\/context\/EditorContext";
import BackButton from "@\/app\/components\/BackButton";

type Blog = {
  slug: string;
  title: string;
  content: string;
  date: string;
};

export default function BlogsClient() {
  const { editorMode } = useEditor();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/writings?type=blogs")
      .then((res) => res.json())
      .then(setBlogs)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const newBlog: Blog = {
      slug: `blog-${Date.now()}`,
      title: "Untitled Blog",
      content: "",
      date: new Date().toISOString().slice(0, 10),
    };
    await fetch("/api/writings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "blogs", item: newBlog }),
    });
    setBlogs((prev) => [...prev, newBlog]);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this blog?")) return;
    await fetch(`/api/writings?type=blogs&slug=${slug}`, { method: "DELETE" });
    setBlogs((prev) => prev.filter((b) => b.slug !== slug));
  };

  return (
    <main className="max-w-4xl mx-auto py-10">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blogs</h1>
        {editorMode && (
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            + Add Blog
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-400">No blogs yet.</p>
      ) : (
        blogs.map((b) => (
          <div
            key={b.slug}
            className="p-4 border border-gray-800 rounded mb-3 hover:bg-gray-900"
          >
            <h2 className="text-lg font-medium">{b.title}</h2>
            <p className="text-sm text-gray-400">{b.date}</p>
            {editorMode && (
              <button
                onClick={() => handleDelete(b.slug)}
                className="mt-2 px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </main>
  );
}



