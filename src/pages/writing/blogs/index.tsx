// src/pages/writing/blogs/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loadBlogs, deleteBlog } from "@/client/api/blogs";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";

import type { Blog } from "@/client/api/blogs";

export default function BlogsIndexPage() {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadBlogs();
        setBlogs(data || []);
      } catch {
        alert("Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(slug: string) {
    if (!window.confirm("Delete this blog post?")) return;

    try {
      await deleteBlog(slug);
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
    } catch {
      alert("Delete failed.");
    }
  }

  function stripHTML(html: string) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <BackButton label="Back" to="/writing" />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-pink-400">Blogs</h1>

        {editorMode && (
          <button
            onClick={() => navigate("/writing/blogs/new")}
            className="px-4 py-2 bg-pink-600 rounded-lg text-white hover:bg-pink-500"
          >
            + New Blog
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-400 italic">No blogs available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.slug}
              onClick={() =>
                editorMode
                  ? navigate(`/writing/blogs/${blog.slug}/edit`)
                  : navigate(`/writing/blogs/${blog.slug}`)
              }
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 cursor-pointer hover:border-pink-500 transition"
            >
              <h2 className="text-lg font-semibold text-gray-100">
                {blog.title}
              </h2>

              <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                {stripHTML(blog.content)}
              </p>

              <p className="text-xs text-gray-500 mt-3">
                {new Date(blog.updatedAt).toLocaleString()}
              </p>

              {editorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(blog.slug);
                  }}
                  className="mt-3 px-3 py-1 text-sm bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
