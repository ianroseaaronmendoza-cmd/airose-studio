// src/pages/writing/blogs/[slug].tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";

interface BlogPost {
  title: string;
  content?: string;
  body?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function BlogViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const res = await fetch(`/data/blogs/${slug}.json`);
        if (res.ok) {
          setBlog(await res.json());
        }
      } catch (err) {
        console.error("Failed to load blog:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  async function handleDelete() {
    if (!confirm(`Delete blog "${blog?.title}"?`)) return;

    try {
      const res = await fetch("/dev/blog/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) throw new Error("Delete failed");

      navigate("/writing/blogs");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  }

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-gray-300 mb-4">Blog Not Found</h2>
        <Link to="/writing/blogs" className="text-pink-500 hover:underline">
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  const html = blog.content || blog.body || "";

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      {/* ✅ BackButton with more spacing */}
      <BackButton to="/writing/blogs" label="Back to Blogs" className="mb-8" />

      {/* Title */}
      <h1 className="text-4xl font-bold text-pink-400 mb-6">{blog.title}</h1>

      {/* Metadata */}
      {blog.createdAt && (
        <div className="text-sm text-gray-500 mb-8">
          Published {new Date(blog.createdAt).toLocaleDateString()}
          {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
            <span className="ml-3">
              • Updated {new Date(blog.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Editor Controls - Only visible in editor mode */}
      {editorMode && (
        <div className="flex gap-3 mb-8">
          <Link
            to={`/writing/blogs/${slug}/edit`}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white"
          >
            Edit Blog
          </Link>

          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-950 rounded"
          >
            Delete Blog
          </button>
        </div>
      )}

      {/* Content */}
      <article className="prose prose-invert max-w-none leading-relaxed text-gray-100">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="text-gray-500">No content yet.</div>
        )}
      </article>
    </div>
  );
}
