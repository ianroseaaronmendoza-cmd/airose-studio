"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import BackButton from "@/components/BackButton";

interface Poem {
  slug: string;
  title: string;
  content: string;
}

export default function PoemPage() {
  const { editorMode } = useEditor();
  const params = useParams() as { slug?: string };
  const slug = params?.slug ?? "";
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (slug === "new" || !slug) {
          setTitle("");
          setContent("");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        const poem = (json.poems || []).find((p: Poem) => p.slug === slug);
        if (!poem) {
          setTitle("Not found");
          setContent("");
        } else {
          setTitle(poem.title);
          setContent(poem.content);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug, title, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      router.push("/writing/poems");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this poem?")) return;
    try {
      const res = await fetch("/api/writings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      router.push("/writing/poems");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-6 text-gray-400">Loading poem…</p>;

  if (!editorMode && slug !== "new")
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 text-gray-100">
        <BackButton label="Back to Poems" />
        <h1 className="text-3xl font-bold mb-4 mt-6">{title}</h1>
        <pre className="whitespace-pre-wrap text-gray-300">{content}</pre>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 text-gray-100">
      <BackButton label="Back to Poems" />

      <h1 className="text-2xl font-semibold mb-3 mt-6">
        {slug === "new" ? "Create Poem" : "Edit Poem"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            placeholder="Poem title"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            placeholder="Write your poem..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-pink-600 rounded text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {slug !== "new" && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-500 text-red-500 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
