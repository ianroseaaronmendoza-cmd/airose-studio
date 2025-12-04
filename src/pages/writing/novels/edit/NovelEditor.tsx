import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "@/components/BackButton";
import { uploadImage } from "@/utils/uploadImage";
import { useEditor } from "@/context/EditorContext";
import slugify from "slugify";

export default function NovelEditorPage() {
  const { novelSlug } = useParams<{ novelSlug: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [note, setNote] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Block access if not in editor mode
  useEffect(() => {
    if (!editorMode) {
      alert("Editor mode is required");
      navigate(`/writing/novels/${novelSlug || ''}`);
    }
  }, [editorMode, navigate, novelSlug]);

  // Load novel meta
  useEffect(() => {
    if (!novelSlug) return;

    (async () => {
      try {
        const res = await fetch(`/data/novels/${novelSlug}/meta.json`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setSummary(data.summary || "");
          setNote(data.note || "");
          setCoverUrl(data.coverUrl || "");
        }
      } catch (err) {
        console.error("Load failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [novelSlug]);

  // Save Novel Metadata
  async function handleSave() {
    if (!novelSlug) return;
    if (!title.trim()) return alert("Title is required.");

    setSaving(true);

    try {
      // Generate new slug from title
      const newSlug = slugify(title.trim(), { lower: true, strict: true });

      const res = await fetch("/dev/novel/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: novelSlug,
          newSlug: newSlug !== novelSlug ? newSlug : undefined,
          title: title.trim(),
          summary: summary.trim(),
          note: note.trim(),
          coverUrl: coverUrl || "",
          updatedAt: Date.now(),
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const { saved } = await res.json();
      alert("Novel updated!");

      // Navigate to new slug if changed
      navigate(`/writing/novels/${saved.slug}`);
    } catch (err: any) {
      alert("Failed to save: " + err?.message);
    } finally {
      setSaving(false);
    }
  }

  // Upload Cover
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    console.log("📤 Starting cover upload:", file.name);

    try {
      const url = await uploadImage(file, "novels");
      console.log("✅ Upload successful, URL:", url);
      console.log("✅ Setting coverUrl state to:", url);
      
      setCoverUrl(url);
      
      console.log("✅ State updated");
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed: " + err?.message);
    }
  }

  if (!editorMode) return null;

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  return (
    <div className="w-full text-gray-100 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      {/* ✅ BackButton is here */}
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
            className="w-full bg-neutral-900 border border-neutral-800 rounded text-white px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Novel title"
          />
          <p className="text-xs text-gray-500 mt-1">
            Slug: {slugify(title.trim() || "untitled", { lower: true, strict: true })}
          </p>
        </div>

        {/* SUMMARY */}
        <div>
          <label className="block text-gray-400 mb-1">Summary/Synopsis</label>
          <textarea
            className="w-full bg-neutral-900 border border-neutral-800 rounded min-h-[120px] text-white px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary of your novel"
          />
        </div>

        {/* NOTES */}
        <div>
          <label className="block text-gray-400 mb-1">Author Notes</label>
          <textarea
            className="w-full bg-neutral-900 border border-neutral-800 rounded min-h-[120px] text-white px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Private notes"
          />
        </div>

        {/* COVER IMAGE */}
        <div>
          <label className="block text-gray-400 mb-1">Cover Image</label>

          {/* ✅ Debug info */}
          <div className="mb-2 p-2 bg-neutral-800 rounded text-xs">
            <p>Cover URL: {coverUrl || "(empty)"}</p>
            <p>URL length: {coverUrl?.length || 0}</p>
          </div>

          {coverUrl && (
            <div className="mb-3">
              <img
                src={coverUrl}
                alt="cover"
                className="w-48 h-auto rounded border border-neutral-700"
                onLoad={() => console.log("✅ Cover image loaded successfully")}
                onError={(e) => {
                  console.error("❌ Cover image failed to load");
                  console.error("URL:", coverUrl);
                  console.error("Error:", e);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">{coverUrl}</p>
            </div>
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
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
