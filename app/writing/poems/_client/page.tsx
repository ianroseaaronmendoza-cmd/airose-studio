"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PoemEditorSlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPoem() {
      try {
        const res = await fetch("/api/writings/poems");
        const data = await res.json();
        const poem = data.poems.find((p: any) => p.slug === slug);
        if (poem) {
          setTitle(poem.title);
          setContent(poem.content);
        }
      } finally {
        setLoading(false);
      }
    }
    loadPoem();
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug, title, content }),
      });
      router.push("/writing/poems");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading poem...</p>;

  return (
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8">
      <button
        onClick={() => router.push("/writing/poems")}
        className="mb-6 text-pink-400 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Edit Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1">Slug</label>
          <input
            value={slug}
            disabled
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 opacity-70"
          />
        </div>

        <div>
          <label className="block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
          />
        </div>

        <div>
          <label className="block mb-1">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
