import React from "react";
import { API_BASE } from "@/config";

type Props = {
  title: string;
  summary?: string;
  note?: string;
  coverUrl?: string;
  onTitleChange: (s: string) => void;
  onSummaryChange: (s: string) => void;
  onNoteChange: (s: string) => void;
  onCoverFile: (f: File | null) => void;
};

export default function NovelEditor({
  title,
  summary,
  note,
  coverUrl,
  onTitleChange,
  onSummaryChange,
  onNoteChange,
  onCoverFile,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter novel title"
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          placeholder="Write a short summary..."
          rows={4}
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Note (updates)</label>
        <input
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Optional note about updates..."
          className="w-full bg-[#0a0a0a] border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
        />
      </div>

      {/* Cover */}
      <div>
        <label className="block mb-1 text-gray-300 font-medium">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onCoverFile(e.target.files?.[0] ?? null)}
          className="text-gray-400"
        />

        {coverUrl && (
          <div className="mt-3">
            <img
              src={
                coverUrl.startsWith("blob:")
                  ? coverUrl
                  : `${API_BASE}${coverUrl}`
              }
              alt="Cover"
              className="w-36 rounded-md border border-gray-700 shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}
