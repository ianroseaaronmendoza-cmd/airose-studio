// src/components/NovelForm.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import slugify from "slugify";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/config";

type NovelFormProps = {
  mode: "create" | "edit";
  novel?: {
    id: number;
    title: string;
    slug: string;
    summary?: string;
    note?: string;
    coverUrl?: string;
  };
};

export default function NovelForm({ mode, novel }: NovelFormProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(novel?.title || "");
  const [slug, setSlug] = useState(novel?.slug || "");
  const [summary, setSummary] = useState(novel?.summary || "");
  const [note, setNote] = useState(novel?.note || "");

  // Stored value for backend
  const [coverUrl, setCoverUrl] = useState<string>(novel?.coverUrl || "");

  // UI preview only
  const [previewUrl, setPreviewUrl] = useState<string>(
    novel?.coverUrl ? `${API_BASE}${novel.coverUrl}` : ""
  );

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug only in create mode
  useEffect(() => {
    if (mode === "create" && title.trim()) {
      const cleanSlug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@#?,]/g,
      });
      setSlug(cleanSlug);
    }
  }, [title, mode]);

  // ===============================
  //  IMAGE UPLOAD HANDLER
  // ===============================
  async function handleImageUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE}/api/upload`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url; // e.g. "/uploads/cover-123.jpg"
  }

  // ===============================
  //  FORM SUBMIT HANDLER
  // ===============================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);

      let finalCoverUrl = coverUrl;

      // Upload file only if user picked a new one
      if (coverFile) {
        finalCoverUrl = await handleImageUpload(coverFile);
        setCoverUrl(finalCoverUrl);
      }

      const payload = {
        title: title.trim(),
        slug,
        summary,
        note,
        coverUrl: finalCoverUrl,
      };

      if (mode === "create") {
        await axios.post(`${API_BASE}/api/novels`, payload, {
          withCredentials: true,
        });
      } else if (mode === "edit" && novel?.slug) {
        await axios.put(`${API_BASE}/api/novels/${novel.slug}`, payload, {
          withCredentials: true,
        });
      }

      navigate("/writing/novels");
    } catch (error) {
      console.error("Novel save error:", error);
      alert("Something went wrong while saving your novel.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 text-gray-100"
    >
      {/* Title */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your novel title"
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Synopsis</label>
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A short summary or teaser for your story..."
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition resize-none"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">
          Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any author notes or update remarks"
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* Cover Upload */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setCoverFile(file);
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
          className="text-gray-300"
        />

        {previewUrl && (
          <div className="mt-3">
            <img
              src={previewUrl}
              alt="Cover preview"
              className="w-48 rounded-md border border-gray-700 shadow-md"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-2 font-semibold rounded-md text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition ${
            saving ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {saving
            ? "Saving..."
            : mode === "create"
            ? "Create Novel"
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
