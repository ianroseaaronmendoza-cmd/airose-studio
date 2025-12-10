// src/pages/MusicPage.tsx

import React, { useEffect, useState } from "react";
import MusicViewer from "../components/MusicViewer";
import MusicManager from "../components/MusicManager";
import { useEditor } from "../context/EditorContext";
import { IS_PRODUCTION } from "../lib/config";

export default function MusicPage() {
  const { editorMode } = useEditor();

  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/data/music.json", { cache: "no-store" });
        const json = await res.json();
        if (mounted) setAlbums(json.albums || []);
      } catch (err) {
        console.error("Music load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [editorMode]); // reload when switching editor mode in dev

  // ------------------------------------
  // LOADING STATE
  // ------------------------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-[#0a0a0a]">
        Loading music...
      </div>
    );

  // ------------------------------------
  // DEV MODE → allow editing
  // ------------------------------------
  if (!IS_PRODUCTION && editorMode) {
    return <MusicManager />;
  }

  // ------------------------------------
  // PRODUCTION VIEW
  // ------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center px-2 py-4 sm:px-8 sm:py-10 text-gray-100">
      <div className="w-full max-w-3xl mx-auto py-6 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
          🎵 Music Library
        </h1>
        <p className="text-gray-400 mb-4">
          Listen to original tracks and soundscapes from Airose Studio.
        </p>
        <MusicViewer albums={albums} />
        <p className="ml-4 sm:ml-0">
          {/* Caption text */}
        </p>
      </div>
    </div>
  );
}
