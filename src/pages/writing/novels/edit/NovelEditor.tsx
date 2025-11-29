import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "@/components/BackButton";
import { uploadImage } from "@/utils/uploadImage";

import {
  loadNovel,
  saveNovelMeta,
} from "@/client/api/novels";

export default function NovelEditorPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();

  const [novel, setNovel] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [note, setNote] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // Load novel meta
  // ---------------------------------------
  useEffect(() => {
    if (!novelSlug) return;

    (async () => {
      const data = await loadNovel(novelSlug);
      if (data) {
        setNovel(data);
        setTitle(data.title || "");
        setSummary(data.summary || "");
        setNote(data.note || "");
        setCoverUrl(data.coverUrl || "");
      }
      setLoading(false);
    })();
  }, [novelSlug]);

  // ---------------------------------------
  // Save Novel Metadata
  // ---------------------------------------
  async function handleSave() {
    if (!novelSlug) return;
    if (!title.trim()) return alert("Title is required.");

    setSaving(true);

    try {
      const saved = await saveNovelMeta({
        slug: novelSlug,
        title: title.trim(),
        summary: summary.trim(),
        note: note.trim(),
        coverUrl: coverUrl || "",
        updatedAt: Date.now(),
      });

      alert("Novel updated!");

      navigate(`/writing/novels/${novelSlug}`);
    } catch (err: any) {
      alert("Failed to save: " + err?.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------
  // Upload Cover
  // ---------------------------------------
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const url = await uploadImage(file, "novels");
      setCoverUrl(url);
    } catch (err: any) {
      alert("Cover upload failed: " + err?.message);
    }
  }

  // ---------------------------------------
  // LOADING STATE
  // ---------------------------------------
  if (loading) {
    return <div className="text-gray-400 p-10">Loading novel…</div>;
  }

  if (!novel) {
    return <div className="text-red-500 p-10">Novel not found.</div>;
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-100">

      <BackButton
        to={`/writing/novels/${novelSlug}`}
        label="Back to Novel"
      />

      <h1 className="text-4xl font-bold text-pink-400 mb-6">
        Edit Novel
      </h1>

      <div className="space-y-8">

        {/* TITLE */}
        <div>
          <label className="block text-gray-400 mb-1">Title</label>
          <input
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Novel title"
          />
        </div>

        {/* SUMMARY */}
        <div>
          <label className="block text-gray-400 mb-1">Summary</label>
          <textarea
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded min-h-[120px]"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary of your novel"
          />
        </div>

        {/* NOTES */}
        <div>
          <label className="block text-gray-400 mb-1">Notes</label>
          <textarea
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded min-h-[120px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Private author notes"
          />
        </div>

        {/* COVER IMAGE */}
        <div>
          <label className="block text-gray-400 mb-1">Cover Image</label>

          {coverUrl && (
            <img
              src={coverUrl}
              alt="cover"
              className="w-48 h-auto rounded border border-neutral-700 mb-3"
            />
          )}

          <label className="inline-block bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded text-white cursor-pointer">
            Upload Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
