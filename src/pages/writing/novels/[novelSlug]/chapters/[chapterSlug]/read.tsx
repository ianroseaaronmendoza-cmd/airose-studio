// src/pages/writing/novels/[novelSlug]/chapters/[chapterSlug]/read.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BackButton from "@/components/BackButton";
import { API_BASE } from "@/config";

type Chapter = {
  id: number;
  slug: string;
  title: string;
  body?: string;
  content?: string;
  updatedAt?: string;
  position: number;
};

export default function ReadChapterPage() {
  const { novelSlug, chapterSlug } = useParams<{
    novelSlug: string;
    chapterSlug: string;
  }>();

  const navigate = useNavigate();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [prevChapter, setPrevChapter] = useState<Chapter | null>(null);
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null);

  // -------------------------------
  // 📡 Load current chapter
  // -------------------------------
  useEffect(() => {
    const loadChapter = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/novels/${encodeURIComponent(
            novelSlug!
          )}/chapters/${encodeURIComponent(chapterSlug!)}`,
          { withCredentials: true }
        );
        setChapter(res.data);
      } catch (err) {
        console.error("Failed to load chapter:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [novelSlug, chapterSlug]);

  // -------------------------------
  // 📚 Load all chapters in novel (for next/prev)
  // -------------------------------
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/novels/${encodeURIComponent(novelSlug!)}/chapters`,
          { withCredentials: true }
        );
        setAllChapters(res.data);
      } catch (err) {
        console.error("Failed to fetch chapter list:", err);
      }
    };

    loadChapters();
  }, [novelSlug]);

  // -------------------------------
  // 🔀 Compute next & previous chapters
  // -------------------------------
  useEffect(() => {
    if (!chapter || allChapters.length === 0) return;

    const sorted = [...allChapters].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );

    const index = sorted.findIndex((c) => c.slug === chapter.slug);

    setPrevChapter(sorted[index - 1] || null);
    setNextChapter(sorted[index + 1] || null);
  }, [chapter, allChapters]);

  // -------------------------------
  // 🧭 Navigation functions
  // -------------------------------
  const goToChapter = (slug: string) => {
    navigate(`/writing/novels/${novelSlug}/chapters/${slug}`);
  };

  if (loading) {
    return (
      <div className="text-gray-400 p-10">
        <p>Loading chapter...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="text-gray-400 p-10">
        <BackButton to="/writing/novels" label="Back to Novels" />
        <p>Chapter not found.</p>
      </div>
    );
  }

  const html = chapter.content ?? chapter.body ?? "";

  return (
    <main className="w-full px-6 py-10 text-gray-100 flex-1">
      <div className="max-w-4xl mx-auto">
        <BackButton
          to="/writing/novels"
          label="Back to Novels"
          className="mb-6"
        />

        <h1 className="text-4xl font-bold text-pink-400 mb-2 lowercase">
          {chapter.title}
        </h1>

        {chapter.updatedAt && (
          <div className="text-sm text-gray-500 mb-6">
            Updated {new Date(chapter.updatedAt).toLocaleString()}
          </div>
        )}

        {/* Chapter HTML */}
        <article className="prose prose-invert max-w-none leading-relaxed text-gray-100 text-left">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="text-gray-500">No content yet.</div>
          )}
        </article>

        {/* ----------------------------------------------------
           🟥 Previous / Next Chapter Bar (full width)
        ---------------------------------------------------- */}
        <div className="mt-16 grid grid-cols-2 w-full text-sm font-semibold">

          {/* Previous */}
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && goToChapter(prevChapter.slug)}
            className={`py-4 transition text-white 
              ${prevChapter
                ? "bg-[#7a0000] hover:bg-[#a30000] cursor-pointer"
                : "bg-[#3a0000] opacity-30 cursor-default"}
            `}
          >
            {prevChapter ? `← ${prevChapter.title}` : "No previous chapter"}
          </button>

          {/* Next */}
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && goToChapter(nextChapter.slug)}
            className={`py-4 transition text-white 
              ${nextChapter
                ? "bg-[#675900] hover:bg-[#836f00] cursor-pointer"
                : "bg-[#3a3000] opacity-30 cursor-default"}
            `}
          >
            {nextChapter ? `${nextChapter.title} →` : "No next chapter"}
          </button>

        </div>
      </div>
    </main>
  );
}
