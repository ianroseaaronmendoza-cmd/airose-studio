"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";

interface Poem {
  slug: string;
  title: string;
  content: string;
}

export default function PoemEditorPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPoem() {
      if (slug === "new") {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        const poem: Poem | undefined = json.poems.find(
          (p: Poem) => p.slug === slug
        );
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

  async function handleSave() {
    setSaving(true);
    await fetch("/api/writings/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "poems", slug, title, content }),
    });
    setSaving(false);
    router.push("/writing/poems");
  }

  async function handleDelete() {
    if (!confirm("Delete this poem?")) return;
    await fetch("/api/writings/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "poems", slug }),
    });
    router.push("/writing/poems");
  }

  if (loading) return <p className="text-gray-400 px-6 py-6">Loading...</p>;

  if (!editorMode && slug !== "new") {
    return (
      <div className="text-center mt-10 text-gray-100">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6 text-gray-100">
      <button
        onClick={() => router.push("/writing/poems")}
        className="mb-6 text-sm text-gray-400 hover:text-pink-400"
      >
        ← Back to Poems
      </button>

      <h1 className="text-2xl font-semibold mb-4">
        {slug === "new" ? "Create New Poem" : "Edit Poem"}
      </h1>

      <input
        className="w-full mb-3 px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-4 px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700"
        rows={10}
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {slug !== "new" && (
          <button
            onClick={handleDelete}
            className="border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
