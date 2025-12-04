// src/pages/writing/novels/[novelSlug]/chapters/[chapterSlug]/read.tsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "@/components/BackButton";

type Chapter = {
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
        const res = await fetch(
          `/data/novels/${novelSlug}/chapters/${chapterSlug}.json`
        );
        if (!res.ok) throw new Error("Chapter not found");
        const data = await res.json();
        setChapter(data);
      } catch (err) {
        console.error("Failed to load chapter:", err);
      } finally {
        setLoading(false);
      }
    };

    if (novelSlug && chapterSlug) {
      loadChapter();
    }
  }, [novelSlug, chapterSlug]);

  // -------------------------------
  // 📚 Load all chapters in novel (for next/prev)
  // -------------------------------
  useEffect(() => {
    const loadChapters = async () => {
      try {
        // Try index.json first
        let res = await fetch(`/data/novels/${novelSlug}/chapters/index.json`);
        
        // Fallback to chapters.json
        if (!res.ok) {
          res = await fetch(`/data/novels/${novelSlug}/chapters.json`);
        }
        
        if (!res.ok) throw new Error("Chapters not found");
        
        const data = await res.json();
        console.log("Loaded chapters:", data); // Debug log
        setAllChapters(data);
      } catch (err) {
        console.error("Failed to fetch chapter list:", err);
      }
    };

    if (novelSlug) {
      loadChapters();
    }
  }, [novelSlug]);

  // -------------------------------
  // 🔀 Compute next & previous chapters
  // -------------------------------
  useEffect(() => {
    if (!chapter || allChapters.length === 0) return;

    const sorted = [...allChapters].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );

    console.log("Current chapter:", chapter.slug);
    console.log("Sorted chapters:", sorted.map(c => ({ slug: c.slug, position: c.position })));

    const index = sorted.findIndex((c) => c.slug === chapter.slug);
    console.log("Chapter index:", index);

    setPrevChapter(sorted[index - 1] || null);
    setNextChapter(sorted[index + 1] || null);
  }, [chapter, allChapters]);

  // -------------------------------
  // 🧭 Navigation functions
  // -------------------------------
  const goToChapter = (slug: string) => {
    navigate(`/writing/novels/${novelSlug}/chapters/${slug}/read`);
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
        <BackButton to={`/writing/novels/${novelSlug}`} label="Back to Novel" />
        <p>Chapter not found.</p>
      </div>
    );
  }

  const html = chapter.content ?? chapter.body ?? "";

  return (
    <main className="w-full text-gray-100 flex-1 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <div className="w-full sm: lg: px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        <BackButton
          to={`/writing/novels/${novelSlug}`}
          label="Back to Novel"
          className="mb-6"
        />

        <h1 className="text-4xl font-bold text-pink-400 mb-2">
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

        {/* Previous / Next Chapter Bar */}
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
