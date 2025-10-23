"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { blogs as defaultBlogs } from "@/data/writings";
import { useEditor } from "@/app/layout"; // get global editor state

type Props = { params: { slug: string } };

export default function BlogSlugPage({ params }: Props) {
  const router = useRouter();
  const { editorMode } = useEditor(); // 👈 use global editor context
  const { slug } = params;

  const [post, setPost] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("blogs");
    const localBlogs = local ? JSON.parse(local) : [];
    const allBlogs = [...defaultBlogs, ...localBlogs];
    const found = allBlogs.find((b) => b.slug === slug);
    if (found) setPost(found);
    else setNotFound(true);
  }, [slug]);

  // 🔹 Save edits to localStorage whenever post changes (and in edit mode)
  useEffect(() => {
    if (post && editorMode) {
      const local = localStorage.getItem("blogs");
      const localBlogs = local ? JSON.parse(local) : [];
      const others = localBlogs.filter((b: any) => b.slug !== post.slug);
      localStorage.setItem("blogs", JSON.stringify([...others, post]));
    }
  }, [post, editorMode]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4 text-pink-400">404 — Blog Not Found</h1>
        <p className="text-gray-400 mb-6">This post may have been deleted or renamed.</p>
        <button
          onClick={() => router.push("/writing/blogs")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition"
        >
          ← Back to Blogs
        </button>
      </main>
    );
  }

  if (!post) return null;

  // 🔹 Helper to update fields in edit mode
  const handleChange = (field: string, value: string) => {
    if (!editorMode) return;
    setPost({ ...post, [field]: value });
  };

  return (
    <main className="max-w-3xl mx-auto py-10">
      {editorMode ? (
        <>
          <input
            className="text-3xl font-bold mb-2 w-full bg-transparent border-b border-gray-700 focus:border-pink-400 outline-none"
            value={post.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <input
            className="text-xs text-gray-500 mb-6 w-full bg-transparent border-b border-gray-800 outline-none"
            value={post.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          <textarea
            className="w-full h-80 p-4 bg-gray-900 rounded-lg text-gray-100 font-light border border-gray-700 focus:border-pink-400 outline-none"
            value={post.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{post.date}</p>
          <article className="prose prose-invert mb-10">
            {post.content.split("\n").map((line: string, i: number) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </article>
        </>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push("/writing/blogs")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-pink-400 text-sm transition mt-6"
      >
        ← Back to Blogs
      </button>
    </main>
  );
}
