// src/pages/writing/blogs/[slug].tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { loadBlog } from "@/client/api/blogs";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";
import BlogEditor from "./edit/BlogEditor";

export default function BlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { editorMode } = useEditor();

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const data = await loadBlog(slug);
        setBlog(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <p className="text-gray-400 mt-10">Loading...</p>;
  if (!blog) return <p className="text-gray-400 mt-10">Blog not found.</p>;

  // 🔥 EDIT MODE
  if (editorMode) {
    return (
      <div className="p-6">
        <BlogEditor
          initial={{
            slug: blog.slug,
            title: blog.title,
            content: blog.content,
            coverImage: blog.coverImage || "",
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          }}
          onSaved={(saved) => navigate(`/writing/blogs/${saved.slug}`)}
        />
      </div>
    );
  }

  // 🔥 VIEW MODE
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BackButton label="Back to Blogs" to="/writing/blogs" />

      {blog.coverImage && (
        <img
          src={blog.coverImage}
          className="rounded-xl w-full max-h-[400px] object-cover border border-neutral-700 mb-6"
        />
      )}

      <h1 className="text-4xl font-bold text-pink-400 mb-4">
        {blog.title}
      </h1>

      <article
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
