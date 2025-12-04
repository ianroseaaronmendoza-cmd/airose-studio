// src/pages/writing/blogs/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";

import type { Blog } from "@/client/api/blogs";

export default function BlogsIndexPage() {
  const [blogs, setBlogPosts] = useState<Blog[]>([]);
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      const res = await fetch("/data/blogs/index.json");
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data);
      }
    } catch (err) {
      console.error("Error loading blogs:", err);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch("/dev/blog/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setBlogPosts((prev) => prev.filter((b) => b.slug !== slug));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + err);
    }
  }

  return (
    <div className="w-full p-6 text-gray-100 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <div className="mb-6">
        <BackButton to="/writing" />
      </div>

      <h2 className="text-4xl font-bold !text-pink-400 mb-2">Blogs</h2>
      <p className="text-gray-400 mb-6">
        Thoughts, insights, and updates from Airose Studio.
      </p>

      {editorMode && (
        <button
          onClick={() => navigate("/writing/blogs/new")}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold py-2 px-5 rounded-xl mb-6 transition"
        >
          + New Blog Post
        </button>
      )}

      {blogs.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center">
          No blog posts yet. Start writing your first post!
        </p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog.slug}
              onClick={() => navigate(`/writing/blogs/${blog.slug}`)}
              className="p-6 bg-[#111] rounded-2xl border border-gray-800 hover:border-pink-500/50 shadow-sm hover:shadow-pink-500/20 transition cursor-pointer"
            >
              <h3 className="text-xl font-bold !text-pink-300 mb-2">
                {blog.title}
              </h3>
              <p className="text-gray-400 text-sm mb-3">
                {blog.excerpt || "No excerpt available..."}
              </p>
              {blog.date && (
                <p className="text-gray-500 text-xs">
                  {new Date(blog.date).toLocaleDateString()}
                </p>
              )}

              {editorMode && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/writing/blogs/edit/${blog.slug}`);
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(blog.slug);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
