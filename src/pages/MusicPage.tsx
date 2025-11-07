import React, { useEffect, useState } from "react";
import { useEditor } from "../context/EditorContext";
import MusicViewer from "../components/MusicViewer";
import MusicManager from "../components/MusicManager";

export default function MusicPage() {
  const { isAuthenticated, editorMode } = useEditor();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if NOT in editor mode (MusicManager handles its own loading)
    if (editorMode && isAuthenticated) {
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/music/load");
        if (res.ok) {
          const json = await res.json();
          if (active && json.albums) setAlbums(json.albums);
        } else {
          // fallback to local file (for dev/offline mode)
          const local = await fetch("/data/music.json");
          const j = await local.json();
          if (active && j.albums) setAlbums(j.albums);
        }
      } catch (err) {
        console.error("Failed to load music:", err);
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

  // 🔁 Conditional Rendering
  if (editorMode && isAuthenticated) {
    return <MusicManager />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center px-6 py-10 text-gray-100">
      <div className="w-full max-w-3xl">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-pink-400 mb-2 flex items-center gap-2">
          <span role="img" aria-label="music">🎵</span> Music Library
        </h1>

        {/* Caption like the Writing page */}
        <p className="text-gray-300 text-base mb-8 leading-relaxed">
          Explore albums and songs by Airose Official. Listen, read the stories behind each track,
          and discover the message in every melody.
        </p>

        {/* Music Viewer */}
        <MusicViewer albums={albums} editorMode={false} />
      </div>
    </div>
  );
}
