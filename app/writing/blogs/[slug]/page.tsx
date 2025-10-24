// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext"; // we’ll make sure you have this
import { blogs as initialBlogs } from "@/data/writings";


export default function BlogSlugPage({ params }) {
  const { slug } = params;
  const router = useRouter();
  const { editorMode } = useEditor(); // shared from layout.tsx

  const [post, setPost] = useState(null);
  const [allBlogs, setAllBlogs] = useState(initialBlogs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const found = allBlogs.find((b) => b.slug === slug);
    setPost(found || null);
  }, [slug, allBlogs]);

  async function handleSave() {
    if (!post) return;
    setSaving(true);
    setSaved(false);

    try {
      const updatedBlogs = allBlogs.map((b) =>
        b.slug === post.slug ? post : b
      );
      const res = await fetch("/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogs: updatedBlogs,
          poems: [], // preserve other sections if you want to add them later
          novels: [],
        }),
      });

      if (res.ok) {
        setAllBlogs(updatedBlogs);
        setSaved(true);
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
    }
  }

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-10 text-center">
        <p className="text-gray-400">Post not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ← Back
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ← Back
        </button>

        {editorMode && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-3 py-2 rounded ${
              saving
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : saved ? "Saved ✅" : "Save"}
          </button>
        )}
      </div>

      {editorMode ? (
        <div className="space-y-4">
          <input
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
          <textarea
            className="w-full h-60 p-2 bg-gray-900 border border-gray-700 rounded"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
          />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{post.date}</p>
          <article className="prose prose-invert">
            {post.content.split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </article>
        </>
      )}
    </main>
  );
}
