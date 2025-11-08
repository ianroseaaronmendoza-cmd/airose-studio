import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBlog } from "../../../client/api/blogs";
import { useEditor } from "../../../context/EditorContext";
import BackButton from "../../../components/BackButton";
import BlogEditor from "./edit/BlogEditor";

export default function BlogViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { editorMode } = useEditor();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getBlog(slug)
      .then(setBlog)
      .catch(() => alert("Failed to load blog"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-gray-400 mt-10 text-center">Loading...</p>;

  if (!blog) {
    return (
      <div className="text-center text-gray-500 mt-10">
        <BackButton label="Back to Blogs" />
        <p className="mt-4">Blog not found.</p>
      </div>
    );
  }

  // ✅ Editor Mode
  if (editorMode) {
    return (
      <div className="p-6">
        <BlogEditor
          mode="edit"
          slug={slug!}
          initialData={{
            title: blog.title,
            content: blog.content || "",
            coverImage: blog.coverImage || "",
          }}
        />
      </div>
    );
  }

  // ✅ Normal View Mode
  return (
    <div className="p-6">
      <BackButton label="Back to Blogs" />
      <div className="max-w-3xl mx-auto mt-6 space-y-6">
        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="rounded-xl w-full max-h-[400px] object-cover border border-neutral-800"
          />
        )}
        <h1 className="text-3xl font-bold text-pink-400">{blog.title}</h1>
        <div
          className="prose prose-invert max-w-none text-gray-200"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
}
