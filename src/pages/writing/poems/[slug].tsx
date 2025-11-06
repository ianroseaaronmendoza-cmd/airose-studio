import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEditor } from "../../../context/EditorContext";

interface Poem {
  slug: string;
  title: string;
  content: string;
  date?: string;
}

export default function PoemViewPage() {
  const { slug } = useParams<{ slug: string }>();
  const { editorMode } = useEditor();
  const navigate = useNavigate();

  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/writings/poems");
        const data = await res.json();
        const found = (data.poems || []).find((p: Poem) => p.slug === slug);
        setPoem(found || null);
      } catch (err) {
        console.error("Failed to fetch poem:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm("Delete this poem?")) return;
    try {
      const res = await fetch("/api/writings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      window.dispatchEvent(new Event("poemUpdated"));
      navigate("/writing/poems");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check console");
    }
  };

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Loading poem...</p>;

  if (!poem)
    return (
      <div className="text-center text-gray-400 mt-10">
        <Link
          to="/writing/poems"
          className="inline-block mb-4 text-pink-400 hover:text-white"
        >
          ← Back to Poems
        </Link>
        <p>Poem not found.</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 pb-32 text-gray-100">
      <Link
        to="/writing/poems"
        className="inline-block mb-4 text-pink-400 hover:text-white"
      >
        ← Back to Poems
      </Link>

      <h1 className="text-3xl font-bold mb-2">{poem.title}</h1>
      {poem.date && (
        <p className="text-sm text-gray-500 mb-6">
          {new Date(poem.date).toLocaleDateString()}
        </p>
      )}

      <div className="whitespace-pre-wrap text-gray-300 border-l-2 border-gray-800 pl-4 leading-relaxed">
        {poem.content}
      </div>

      {editorMode && (
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => navigate(`/writing/poems/edit/${poem.slug}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
