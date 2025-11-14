import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEditor } from "../../../context/EditorContext";
import { getAllBlogs, deleteBlog } from "../../../client/api/blogs";
import BackButton from "../../../components/BackButton";

import type { Blog } from "../../../client/api/blogs";

export default function BlogsIndexPage() {
  const navigate = useNavigate();
  const { isAuthenticated, editorMode } = useEditor();
  const canEdit = isAuthenticated && editorMode;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  /** LOAD BLOGS */
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllBlogs();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** DELETE BLOG */
  async function handleDelete(slug: string) {
    if (!window.confirm("Delete this blog post?")) return;

    try {
      await deleteBlog(slug);
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete blog.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* BACK + ADD */}
      <div className="flex items-center justify-between">
        <BackButton label="Back to Writing" />

        {canEdit && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/writing/blogs/new")}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-medium shadow-md transition"
          >
            + New Blog
          </motion.button>
        )}
      </div>

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-pink-400 mb-1">Blogs</h1>
        <p className="text-sm text-gray-400">
          Personal reflections, creative thoughts, and behind-the-scenes stories.
        </p>
      </div>

      {/* BLOG GRID */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No blogs yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <motion.div
              key={blog.slug}
              whileHover={{ scale: 1.02 }}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all relative"
            >
              {/* CLICK = VIEW (or edit if editorMode) */}
              <div
                className="cursor-pointer"
                onClick={() =>
                  canEdit
                    ? navigate(`/writing/blogs/${blog.slug}/edit`)
                    : navigate(`/writing/blogs/${blog.slug}`)
                }
              >
                <h2 className="text-lg font-semibold text-gray-100 mb-1">
                  {blog.title}
                </h2>

                <p className="text-xs text-gray-500 mb-2">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-400 line-clamp-3">
                  {stripHTML(blog.content).slice(0, 150)}...
                </p>
              </div>

              {/* EDITOR BUTTONS */}
              {canEdit && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => navigate(`/writing/blogs/${blog.slug}/edit`)}
                    className="px-3 py-1 text-sm rounded-md bg-blue-500 hover:bg-blue-400 text-white transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(blog.slug)}
                    className="px-3 py-1 text-sm rounded-md bg-red-500 hover:bg-red-400 text-white transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Remove HTML tags for preview text */
function stripHTML(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
