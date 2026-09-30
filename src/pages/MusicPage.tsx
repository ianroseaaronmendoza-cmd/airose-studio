// src/pages/MusicPage.tsx

import React, { useEffect, useState } from "react";
import MusicViewer from "../components/MusicViewer";
import MusicManager from "../components/MusicManager";
import { useEditor } from "../context/EditorContext";
import PageIntro from "../components/portfolio/PageIntro";
import { IS_PRODUCTION } from "../lib/config";

export default function MusicPage() {
  const { editorMode } = useEditor();

  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/data/music.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Music unavailable");
        const json = await res.json();
        if (mounted) setAlbums(json.albums || []);
      } catch (err) {
        if (mounted) setFailed(true);
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
    <div className="studio-container studio-music">
      <PageIntro eyebrow="03 / Music" title="Songs with something to say.">
        <p>
          Original tracks and soundscapes from Airose Studio. Listen, linger,
          and find a song to carry with you.
        </p>
      </PageIntro>
      {failed ? (
        <p role="alert">
          The music library could not load. Please refresh to try again.
        </p>
      ) : albums.length ? (
        <MusicViewer albums={albums} />
      ) : (
        <p>No releases are listed yet.</p>
      )}
    </div>
  );
}
