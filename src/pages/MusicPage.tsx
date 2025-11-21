import React, { useEffect, useState } from "react";
import MusicViewer from "../components/MusicViewer";
import MusicManager from "../components/MusicManager";
import { useEditor } from "../context/EditorContext";

export default function MusicPage() {
  const { isAuthenticated, editorMode } = useEditor();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Webpack-supported production check
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // PRODUCTION → always load JSON
        if (isProd) {
          const res = await fetch("/data/music.json", { cache: "no-store" });
          const data = await res.json();
          if (active) setAlbums(data.albums || []);
          return;
        }

        // DEVELOPMENT → can mutate JSON in dev run
        const local = await fetch("/data/music.json", { cache: "no-store" });
        const json = await local.json();
        if (active) setAlbums(json.albums || []);
      } catch (err) {
        console.error("Music load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [editorMode, isAuthenticated]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-[#0a0a0a]">
        Loading music...
      </div>
    );

  // DEVELOPMENT + Editor Mode → open MusicManager
  if (!isProd && editorMode && isAuthenticated) {
    return <MusicManager />;
  }

  // PUBLIC VIEW (production or when editorMode is off)
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center px-6 py-10 text-gray-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-pink-400 mb-2">🎵 Music Library</h1>

        <MusicViewer albums={albums} editorMode={false} />
      </div>
    </div>
  );
}
