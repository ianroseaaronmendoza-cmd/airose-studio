import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor } from "../../../../context/EditorContext";
import BackButton from "../../../../components/BackButton";

type Poem = {
  slug: string;
  title: string;
  content: string;
};

export default function EditPoemPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { editorMode } = useEditor();

  const [poem, setPoem] = useState<Poem | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editorMode) {
      navigate(`/writing/poems/${slug}`);
      return;
    }

    const loadPoem = async () => {
      try {
        const res = await fetch("/api/writings/poems");
        const data = await res.json();
        const found = data.poems.find((p: Poem) => p.slug === slug);

        if (found) {
          setPoem(found);
          setTitle(found.title);
          setContent(found.content);
        } else {
          alert("Poem not found.");
          navigate("/writing/poems");
        }
      } catch (err) {
        console.error("Failed to load poem:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPoem();
  }, [slug, editorMode, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/writings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "poems", slug, title, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save poem");

      window.dispatchEvent(new Event("poemUpdated"));

      // ✅ Redirect back to poem list after edit
      navigate("/writing/poems");
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Save failed — check console for details");
    } finally {
      setSaving(false);
    }
  };

  if (!editorMode) {
    return (
      <div className="p-6 text-center text-gray-400">
        <BackButton label="Back to Poems" />
        <p className="mt-6">You must enable Editor Mode to edit poems.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-400 mt-8">Loading poem...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto text-gray-100 px-6 py-8 pb-32">
      <BackButton label="Back to Poems" />

      <h1 className="text-2xl font-bold mt-4 mb-6">Edit Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Slug</label>
          <input
            value={slug}
            disabled
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 opacity-70"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Content</label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/writing/poems")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-md transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
