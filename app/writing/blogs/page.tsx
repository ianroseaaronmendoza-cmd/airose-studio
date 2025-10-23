"use client";

import Link from "next/link";
import { useEditor } from "@/app/layout";
import { useState, useEffect } from "react";
import { blogs as defaultBlogs } from "@/data/writings";

export default function BlogsPage() {
  const { editorMode } = useEditor();
  const [blogs, setBlogs] = useState(defaultBlogs);

  // Load saved blogs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("blogs");
    if (saved) setBlogs(JSON.parse(saved));
  }, []);

  // Save blogs when they change
  useEffect(() => {
    localStorage.setItem("blogs", JSON.stringify(blogs));
  }, [blogs]);

  const addNewBlog = () => {
    const newBlog = {
      slug: `new-post-${Date.now()}`,
      title: "Untitled Blog",
      date: new Date().toISOString().slice(0, 10),
      excerpt: "Click to edit...",
      content: "Start writing your post here.",
    };
    setBlogs([...blogs, newBlog]);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blogs</h1>
        {editorMode && (
          <button
            onClick={addNewBlog}
            className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition"
          >
            + Add New Blog
          </button>
        )}
      </div>

      {blogs.length === 0 ? (
        <p className="text-gray-400">No blog posts found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {blogs.map((b) => (
            <Link
              key={b.slug}
              href={`/writing/blogs/${b.slug}`}
              className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="text-xs text-gray-500">{b.date}</p>
              <p className="text-sm text-gray-400 mt-2">{b.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
