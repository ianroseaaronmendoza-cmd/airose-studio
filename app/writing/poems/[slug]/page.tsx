"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";
import BackButton from "@/components/BackButton";

interface Poem {
  slug: string;
  title: string;
  content: string;
  date?: string;
}

export default function PoemViewPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { editorMode } = useEditor();

  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPoem() {
      try {
        const res = await fetch("/api/writings/poems");
        const data = await res.json();
        const found = data.poems?.find((p: Poem) => p.slug === slug);
        setPoem(found || null);
      } catch (err) {
        console.error("Failed to fetch poem:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPoem();
  }, [slug]);

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Loading poem...</p>;

  if (!poem)
    return (
      <div className="text-center text-gray-400 mt-10">
        <BackButton label="Back to Poems" />
        <p className="mt-4">Poem not found.</p>
      </div>
    );

  const handleDelete = async () => {
    if (!confirm("Delete this poem?")) return;
    try {
      const res = await fetch("/api/writings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete poem");
      router.push("/writing/poems");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete poem.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 text-gray-100">
      <BackButton label="Back to Poems" />

      <h1 className="text-3xl font-bold mt-6 mb-2">{poem.title}</h1>
      {poem.date && (
        <p className="text-sm text-gray-500 mb-6">
          {new Date(poem.date).toLocaleDateString()}
        </p>
      )}

      <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
        {poem.content}
      </div>

      {/* Editor-only options */}
      {editorMode && (
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => router.push(`/writing/poems/edit/${poem.slug}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
