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
  const params = useParams() as { slug?: string };
  const slug = params?.slug ?? "";
  const router = useRouter();
  const { isAuthenticated, editorMode, loading } = useEditor();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // ✅ Redirect unauthenticated users if trying to create/edit
  useEffect(() => {
    if (!loading && !isAuthenticated && slug === "new") {
      alert("You must be logged in as an editor to create poems.");
      router.push("/writing/poems");
    }
  }, [loading, isAuthenticated, slug, router]);

  useEffect(() => {
    async function load() {
      setPageLoading(true);
      try {
        if (slug === "new" || !slug) {
          setTitle("");
          setContent("");
          return;
        }
        const res = await fetch("/api/writings/poems", { cache: "no-store" });
        const json = await res.json();
        const poem: Poem | undefined = (json.poems || []).find(
          (p: Poem) => p.slug === slug
        );
        if (!poem) {
          setTitle("Not found");
          setContent("");
          return;
        }
        setTitle(poem.title);
        setContent(poem.content);
      } catch (err) {
        console.error("Failed to load poem", err);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!slug) return alert("Invalid slug");
    setSaving(true);
    try {
      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug, title, content }),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.error || "Save failed");
      router.push("/writing/poems");
    } catch (err) {
      console.error("Save error", err);
      alert("Save failed");
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
      if (!res.ok) return alert(json.error || "Delete failed");
      router.push("/writing/poems");
    } catch (err) {
      console.error("Delete error", err);
      alert("Delete failed");
    }
  };

  if (pageLoading) {
    return <p className="px-6 py-6 text-gray-400">Loading poem...</p>;
  }

  // ✅ Read-only view for public visitors
  if (!isAuthenticated || !editorMode) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 text-gray-100">
        <button
          onClick={() => router.push("/writing/poems")}
          className="mb-4 text-sm text-gray-400 hover:text-pink-400"
        >
          ← Back to poems
        </button>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <pre className="whitespace-pre-wrap text-gray-300">{content}</pre>
      </div>
    );
  }

  // ✅ Editor view for authenticated editors
  return (
    <div className="max-w-3xl mx-auto px-6 py-6 text-gray-100">
      <button
        onClick={() => router.push("/writing/poems")}
        className="mb-4 text-sm text-gray-400 hover:text-pink-400"
      >
        ← Back to poems
      </button>

      <h1 className="text-2xl font-semibold mb-3">
        {slug === "new" ? "Create Poem" : "Edit Poem"}
      </h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1">Slug</label>
          <input
            value={slug}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded opacity-70"
          />
        </div>

        <div>
          <label className="block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-pink-600 rounded text-white"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {slug !== "new" && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-500 text-red-500 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
