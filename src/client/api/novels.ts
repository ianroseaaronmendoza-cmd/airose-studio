// src/client/api/novels.ts

export interface NovelMeta {
  slug: string;
  title: string;
  summary: string;
  note: string;
  coverUrl: string;
  updatedAt: number;
}

export interface ChapterEntry {
  slug: string;
  title: string;
  position: number;
  updatedAt: number;
}

export interface ChapterData {
  slug: string;
  novelSlug: string;
  title: string;
  updatedAt: number;
  body: string; // HTML
}

const isDev =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.MODE === "development") ||
  process.env.NODE_ENV === "development";

/* -----------------------------------------------------
 * STATIC LOADS (Safe for Vercel)
 * ----------------------------------------------------*/

export async function loadNovels(): Promise<NovelMeta[]> {
  try {
    const res = await fetch("/data/novels/index.json", { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as NovelMeta[];
  } catch {
    return [];
  }
}

export async function loadNovel(slug: string): Promise<NovelMeta | null> {
  try {
    const res = await fetch(`/data/novels/${slug}/meta.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as NovelMeta;
  } catch {
    return null;
  }
}

export async function loadChapters(slug: string): Promise<ChapterEntry[]> {
  try {
    const res = await fetch(`/data/novels/${slug}/chapters/index.json`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as ChapterEntry[];
  } catch {
    return [];
  }
}

export async function loadChapter(
  novelSlug: string,
  chapterSlug: string
): Promise<ChapterData | null> {
  try {
    const res = await fetch(
      `/data/novels/${novelSlug}/chapters/${chapterSlug}.json`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as ChapterData;
  } catch {
    return null;
  }
}

/* -----------------------------------------------------
 * DEV MODE WRITE ACTIONS
 * ----------------------------------------------------*/

export async function saveNovelMeta(meta: NovelMeta): Promise<NovelMeta> {
  if (!isDev) throw new Error("saveNovelMeta is allowed only in dev mode.");

  const res = await fetch("/dev/novel/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meta),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to save novel meta");

  return json.saved as NovelMeta;
}

export async function deleteNovel(slug: string): Promise<void> {
  if (!isDev) throw new Error("deleteNovel is allowed only in dev mode.");

  const res = await fetch("/dev/novel/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to delete novel");
}

export async function saveChapter(params: {
  novelSlug: string;
  chapterSlug: string;
  title: string;
  html: string;
  updatedAt?: number;
}): Promise<ChapterEntry> {
  if (!isDev) throw new Error("saveChapter is allowed only in dev mode.");

  const res = await fetch("/dev/chapter/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to save chapter");

  return json.saved as ChapterEntry;
}

export async function deleteChapter(
  novelSlug: string,
  chapterSlug: string
): Promise<void> {
  if (!isDev) throw new Error("deleteChapter is allowed only in dev mode.");

  const res = await fetch("/dev/chapter/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novelSlug, chapterSlug }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to delete chapter");
}

export async function reorderChapters(
  novelSlug: string,
  newOrder: string[]
): Promise<ChapterEntry[]> {
  if (!isDev) throw new Error("reorderChapters is allowed only in dev mode.");

  const res = await fetch("/dev/chapter/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novelSlug, newOrder }),
  });

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to reorder chapters");

  return json.reordered as ChapterEntry[];
}
