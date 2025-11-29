import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadImage } from "../utils/uploadImage";

export interface NovelMeta {
  slug: string;
  title: string;
  summary?: string;
  note?: string;
  coverUrl?: string;
  updatedAt?: number;
}

export default function NovelForm({
  initial,
  onSaved,
}: {
  initial?: NovelMeta | null;
  onSaved?: (meta: NovelMeta) => void;
}) {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams<{ slug?: string }>();

  const [title, setTitle] = useState(initial?.title || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [note, setNote] = useState(initial?.note || "");
  const [coverUrl, setCoverUrl] = useState<string | undefined>(
    initial?.coverUrl
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(initial?.title || "");
    setSummary(initial?.summary || "");
    setNote(initial?.note || "");
    setCoverUrl(initial?.coverUrl);
  }, [initial]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\- ]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleCoverFile(file?: File) {
    if (!file) return;

    try {
      const url = await uploadImage(file, "novels");
      setCoverUrl(url);
    } catch (err: any) {
      console.error("Cover upload failed", err);
      alert("Cover upload failed: " + (err?.message || err));
    }
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    setSaving(true);

    const generatedSlug = initial?.slug || slugify(title);

    const payload: NovelMeta = {
      slug: generatedSlug,
      title: title.trim(),
      summary: summary.trim(),
      note: note.trim(),
      coverUrl,
      updatedAt: Date.now(),
    };

    try {
      const res = await fetch("/dev/novel/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Save failed");
      }

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "Save returned error");
      }

      const saved = json.saved || payload;
      onSaved?.(saved);

      // NEW NOVEL → go to novel page
      if (!initial) {
        navigate(`/writing/novels/${saved.slug}`);
        return;
      }

      // EDIT MODE → update route if slug changed
      if (routeSlug && routeSlug !== saved.slug) {
        navigate(`/writing/novels/${saved.slug}/edit`);
      }
    } catch (err: any) {
      alert("Save failed: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) await handleCoverFile(f);
    e.currentTarget.value = "";
  }

  return (
    <form
      onSubmit={handleSave}
      className="max-w-3xl mx-auto space-y-6 text-gray-100"
    >
      <div>
        <label className="block text-sm text-gray-400 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 rounded"
          placeholder="Novel Title"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Summary</label>
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 rounded"
          placeholder="Short description"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Author Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 rounded"
          placeholder="Optional author note"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Cover Image</label>
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleCoverChange} />

          {coverUrl ? (
            <img
              src={coverUrl}
              alt="cover preview"
              className="w-28 h-16 object-cover rounded"
            />
          ) : (
            <div className="text-gray-500 text-sm">No cover selected</div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Create Novel"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/writing/novels")}
          className="px-4 py-2 border border-neutral-700 rounded text-gray-300"
        >
          Cancel
        </button>

        {initial && (
          <button
            type="button"
            onClick={() => navigate(`/writing/novels/${initial.slug}`)}
            className="ml-auto px-3 py-1 bg-neutral-800 rounded text-gray-300"
          >
            View Novel
          </button>
        )}
      </div>
    </form>
  );
}
