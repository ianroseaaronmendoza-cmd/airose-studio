import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MusicToolbar from "./MusicToolbar";
import MusicPanel from "./MusicPanel";

export default function MusicEditor() {
  const [albums, setAlbums] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState("edit");
  const [panelAlbum, setPanelAlbum] = useState(null);
  const [panelSong, setPanelSong] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const LS_KEY = "music_local_v1";

  /* ---------------------------------- Load ---------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/music/load", { cache: "no-store" });
        const json = await res.json();
        if (json && Array.isArray(json.albums)) {
          setAlbums(json.albums);
          localStorage.setItem(LS_KEY, JSON.stringify(json.albums));
        }
      } catch {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) setAlbums(JSON.parse(raw));
      }
    })();
  }, []);

  const saveLocal = (data) => {
    setAlbums(data);
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  };

  /* --------------------------------- CRUD ---------------------------------- */
  const addAlbum = () => {
    const newAlbum = {
      id: `alb-${Date.now()}`,
      title: "Untitled Album",
      year: new Date().getFullYear(),
      songs: [],
    };
    const updated = [...albums, newAlbum];
    saveLocal(updated);
  };

  const addSong = (albumId) => {
    const updated = albums.map((a) =>
      a.id === albumId
        ? {
            ...a,
            songs: [
              ...a.songs,
              { id: `song-${Date.now()}`, title: "Untitled Song" },
            ],
          }
        : a
    );
    saveLocal(updated);
  };

  const deleteSong = (albumId, songId) => {
    const updated = albums.map((a) =>
      a.id === albumId
        ? { ...a, songs: a.songs.filter((s) => s.id !== songId) }
        : a
    );
    saveLocal(updated);
  };

  const deleteAlbum = (albumId) => {
    const updated = albums.filter((a) => a.id !== albumId);
    saveLocal(updated);
  };

  /* ------------------------------- Reordering ------------------------------ */
  const moveAlbum = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= albums.length) return;
    const reordered = [...albums];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    saveLocal(reordered);
  };

  const moveSong = (albumId, index, direction) => {
    const updated = albums.map((album) => {
      if (album.id !== albumId) return album;
      const songs = [...album.songs];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= songs.length) return album;
      const [moved] = songs.splice(index, 1);
      songs.splice(newIndex, 0, moved);
      return { ...album, songs };
    });
    saveLocal(updated);
  };

  /* ---------------------------- Editing Panel ----------------------------- */
  const openEditPanel = (album, song) => {
    setPanelAlbum(album);
    setPanelSong(song);
    setPanelMode("edit");
    setPanelOpen(true);
  };

  const handlePanelSave = (payload) => {
    const { type, albumId, songId, updates } = payload;
    let updatedAlbums = [...albums];

    if (type === "song") {
      updatedAlbums = updatedAlbums.map((a) =>
        a.id === albumId
          ? {
              ...a,
              songs: a.songs.map((s) =>
                s.id === songId ? { ...s, ...updates } : s
              ),
            }
          : a
      );
    } else if (type === "album") {
      updatedAlbums = updatedAlbums.map((a) =>
        a.id === albumId ? { ...a, ...updates } : a
      );
    }

    saveLocal(updatedAlbums);
  };

  /* ----------------------------- GitHub Sync ------------------------------ */
  const syncToGitHub = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Sync failed");

      alert("✅ Sync successful — changes pushed to GitHub!");
    } catch (err) {
      alert("❌ Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="p-6 text-gray-200">
      <MusicToolbar
        onAddAlbum={addAlbum}
        onSync={syncToGitHub}
        isSyncing={isSyncing}
      />

      <div className="max-w-5xl mx-auto mt-6 space-y-6">
        {albums.map((album, albIdx) => (
          <motion.div
            key={album.id}
            layout
            className="border border-gray-800 bg-[#111] rounded-2xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg font-semibold text-pink-400">
                  {album.title}
                </h2>
                <p className="text-sm text-gray-400">{album.year}</p>
              </div>

              <div className="flex flex-col gap-2 ml-3">
                <button
                  onClick={() => addSong(album.id)}
                  className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-500 rounded"
                >
                  + Song
                </button>
                <button
                  onClick={() => moveAlbum(albIdx, -1)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveAlbum(albIdx, 1)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {album.songs.map((song, songIdx) => (
                <motion.div
                  key={song.id}
                  layout
                  className="bg-[#141414] border border-gray-800 rounded-lg p-3 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-200 mb-2">
                      🎵 {song.title}
                    </p>
                    {song.spotifyEmbed && (
                      <iframe
                        src={song.spotifyEmbed}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-lg"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-3">
                    <button
                      onClick={() => moveSong(album.id, songIdx, -1)}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSong(album.id, songIdx, 1)}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => openEditPanel(album, song)}
                      className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-500 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteSong(album.id, song.id)}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <MusicPanel
        open={panelOpen}
        mode={panelMode}
        album={panelAlbum}
        song={panelSong}
        onClose={() => setPanelOpen(false)}
        onSave={handlePanelSave}
      />
    </div>
  );
}
