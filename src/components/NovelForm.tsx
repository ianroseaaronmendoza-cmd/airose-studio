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
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\- ]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
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

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // ✅ Add this to prevent form submission
    e.stopPropagation(); // ✅ Add this to stop event bubbling
    
    console.log("🟢 handleCoverChange START");
    
    const file = e.target.files?.[0];
    console.log("🟢 File selected:", file?.name);
    
    e.target.value = "";
    
    if (!file) {
      console.log("🔴 No file, exiting");
      return;
    }

    try {
      console.log("🟢 Setting saving=true");
      setSaving(true);
      setUploadStatus("Compressing image...");
      console.log("📤 Uploading cover:", file.name);

      const url = await uploadImage(file, "novels");
      
      console.log("✅ Cover uploaded:", url);
      console.log("✅ About to call setCoverUrl with:", url);
      
      setCoverUrl(url);
      
      console.log("✅ setCoverUrl called");
      setUploadStatus("Upload complete!");
      
      setTimeout(() => setUploadStatus(""), 2000);
    } catch (error) {
      console.error("❌ Cover upload failed:", error);
      setUploadStatus("");
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log("🟢 Setting saving=false");
      setSaving(false);
    }
  };

  useEffect(() => {
    // Only set initial values ONCE when component mounts
    if (!isInitialized && initial) {
      setTitle(initial.title || "");
      setSummary(initial.summary || "");
      setNote(initial.note || "");
      setCoverUrl(initial.coverUrl); // ✅ Set initial cover only once
      setIsInitialized(true);
    }
  }, [initial, isInitialized]); // ✅ Remove coverUrl from dependencies!

  useEffect(() => {
    console.log("🎬 NovelForm MOUNTED");
    return () => console.log("💀 NovelForm UNMOUNTED");
  }, []);

  console.log("🔍 NovelForm render - coverUrl:", coverUrl, "| initial:", initial?.coverUrl);

  return (
    <form
      onSubmit={handleSave}
      className="w-full space-y-6 text-gray-100"
    >
      {/* ✅ Add debug panel at the top */}
      <div className="bg-yellow-900 border border-yellow-600 p-3 rounded text-xs">
        <p><strong>DEBUG:</strong></p>
        <p>coverUrl: {coverUrl || "(empty)"}</p>
        <p>coverUrl type: {typeof coverUrl}</p>
        <p>coverUrl length: {coverUrl?.length || 0}</p>
        <p>saving: {saving ? "true" : "false"}</p>
        <p>uploadStatus: {uploadStatus || "(empty)"}</p>
      </div>

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

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Cover Image</label>
        
        {/* ✅ Hidden file input */}
        <input
          id="cover-upload"
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          disabled={saving}
          className="hidden" // ✅ Hide the ugly native input
        />
        
        {/* ✅ Custom upload button */}
        <label
          htmlFor="cover-upload"
          className="inline-block bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 px-4 py-2 rounded text-white cursor-pointer transition-colors"
        >
          {saving ? "Uploading..." : coverUrl ? "Change Cover" : "Upload Cover"}
        </label>
        
        {/* ✅ Show current cover if exists */}
        {coverUrl && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <img 
              src={coverUrl} 
              alt="Cover preview" 
              className="w-full max-h-64 rounded border border-gray-600 shadow-lg"
              onLoad={() => console.log("✅ Image loaded successfully:", coverUrl)}
              onError={(e) => {
                console.error("❌ Image failed to load:", coverUrl);
                console.error("Error event:", e);
              }}
            />
            <p className="text-xs text-gray-500 mt-2 break-all">{coverUrl}</p>
          </div>
        )}
        
        {saving && (
          <div className="mt-2 flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">{uploadStatus}</span>
          </div>
        )}
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
