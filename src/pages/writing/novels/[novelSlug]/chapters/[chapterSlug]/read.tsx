import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
type Chapter = {
  slug: string;
  title: string;
  body?: string;
  content?: string;
  position?: number;
};
export default function ReadChapterPage() {
  const { novelSlug, chapterSlug } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null),
    [chapters, setChapters] = useState<Chapter[]>([]),
    [loading, setLoading] = useState(true),
    [large, setLarge] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setChapter(null);
    setChapters([]);
    setLoading(true);
    async function load() {
      try {
        const res = await fetch(
          `/data/novels/${novelSlug}/chapters/${chapterSlug}.json`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Chapter not found");
        const data = await res.json();
        if (!controller.signal.aborted) setChapter(data);
        let index = await fetch(
          `/data/novels/${novelSlug}/chapters/index.json`,
          { signal: controller.signal },
        );
        if (!index.ok)
          index = await fetch(`/data/novels/${novelSlug}/chapters.json`, {
            signal: controller.signal,
          });
        if (index.ok) {
          const list = await index.json();
          if (!controller.signal.aborted)
            setChapters(
              list.sort(
                (a: Chapter, b: Chapter) =>
                  (a.position ?? 0) - (b.position ?? 0),
              ),
            );
        }
      } catch {
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [novelSlug, chapterSlug]);
  const current = chapters.findIndex((c) => c.slug === chapterSlug);
  const previous = current > 0 ? chapters[current - 1] : null,
    next = current >= 0 ? chapters[current + 1] : null;
  const chapterUrl = (slug: string) =>
    `/writing/novels/${novelSlug}/chapters/${slug}/read`;
  return (
    <div className="studio-reader">
      <div className="studio-reader-toolbar">
        <Link className="studio-text-link" to={`/writing/novels/${novelSlug}`}>
          ← Table of contents
        </Link>
        <button aria-pressed={large} onClick={() => setLarge(!large)}>
          Larger text {large ? "on" : "off"}
        </button>
      </div>
      {loading ? (
        <p role="status">Loading chapter…</p>
      ) : !chapter ? (
        <>
          <h1>Chapter not found</h1>
          <p>
            This chapter could not be loaded. Please return to the contents or
            refresh to try again.
          </p>
        </>
      ) : (
        <>
          <header className="studio-intro">
            <p className="studio-eyebrow">
              {current >= 0
                ? `Chapter ${current + 1} of ${chapters.length}`
                : "Reading"}{" "}
              / Free online story
            </p>
            <h1>{chapter.title}</h1>
          </header>
          <article
            className={
              large ? "studio-reading-text is-large" : "studio-reading-text"
            }
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(chapter.body || chapter.content || ""),
            }}
          />
          <nav className="studio-chapter-nav" aria-label="Chapter navigation">
            {previous ? (
              <Link
                className="studio-button secondary"
                to={chapterUrl(previous.slug)}
              >
                ← {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                className="studio-button secondary"
                to={chapterUrl(next.slug)}
              >
                {next.title} →
              </Link>
            ) : (
              <Link
                className="studio-button secondary"
                to={`/writing/novels/${novelSlug}`}
              >
                Back to contents →
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
