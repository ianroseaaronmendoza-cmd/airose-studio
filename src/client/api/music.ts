// src/client/api/music.ts

export interface Song {
  id: string;
  title: string;
  spotifyEmbed?: string;
  lyrics?: string;
  story?: string;
}

export interface Album {
  id: string;
  title: string;
  year?: number | string;
  songs: Song[];
}

export interface MusicFile {
  albums: Album[];
}

const isDev =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.MODE === "development") ||
  process.env.NODE_ENV === "development";

/** Read music.json (static, production-safe) */
export async function loadMusic(): Promise<MusicFile> {
  try {
    const res = await fetch("/data/music.json", { cache: "no-store" });
    if (!res.ok) return { albums: [] };
    return (await res.json()) as MusicFile;
  } catch (err) {
    console.error("loadMusic failed", err);
    return { albums: [] };
  }
}

/** Save music.json (dev-only) */
export async function saveMusic(payload: MusicFile) {
  if (!isDev) {
    throw new Error("Saving music is allowed only in development.");
  }

  const res = await fetch("/dev/music/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save music.json");
  }

  return await res.json();
}
