import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MusicPanel from "./MusicPanel";
import { useEditor } from "../context/EditorContext";

export default function MusicManager() {
  const { editorMode } = useEditor();
  const [albums, setAlbums] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAlbums, setOpenAlbums] = useState({});

  const isProd = false; // ALWAYS editable in dev mode

  // Load albums (JSON-only)
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await fetch("/data/music.json", { cache: "no-store" });
        const json = await res.json();
        const list = json?.albums || [];

        setAlbums(list);

        const init = {};
        list.forEach((a) => (init[a.id] = editorMode));
        setOpenAlbums(init);
      } catch (err) {
        console.error("Music JSON load failed", err);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [editorMode]);

  const toggleAlbum = (id) => {
    if (editorMode) return;
    setOpenAlbums((p) => ({ ...p, [id]: !p[id] }));
  };

  const openPanel = (album, song) => {
    setSelectedAlbum(album);
    setSelectedSong(song);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedAlbum(null);
    setSelectedSong(null);
  };

  const addAlbum = () => {
    const a = {
      id: `alb-${Date.now()}`,
      title: "Untitled Album",
      year: new Date().getFullYear(),
      songs: [],
    };
    setAlbums((prev) => [...prev, a]);
    setOpenAlbums((prev) => ({ ...prev, [a.id]: true }));
  };

  const addSong = (albumId) => {
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === albumId
          ? {
              ...a,
              songs: [
                ...a.songs,
                {
                  id: `song-${Date.now()}`,
                  title: "New Song",
                  spotifyEmbed: "",
                  lyrics: "",
                  story: "",
                },
              ],
            }
          : a
      )
    );
  };

  const deleteAlbum = (id) =>
    setAlbums((prev) => prev.filter((a) => a.id !== id));

  const deleteSong = (albumId, songId) =>
    setAlbums((prev) =>
      prev.map((a) =>
        a.id !== albumId
          ? a
          : { ...a, songs: a.songs.filter((s) => s.id !== songId) }
      )
    );

  const moveAlbum = (index, dir) => {
    const updated = [...albums];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + dir, 0, moved);
    setAlbums(updated);
  };

  const moveSong = (albumId, index, dir) => {
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id !== albumId) return a;
        const arr = [...a.songs];
        const [moved] = arr.splice(index, 1);
        arr.splice(index + dir, 0, moved);
        return { ...a, songs: arr };
      })
    );
  };

  const handleSaveSong = (albumId, updatedSong) => {
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === albumId
          ? {
              ...a,
              songs: a.songs.map((s) =>
                s.id === updatedSong.id ? updatedSong : s
              ),
            }
          : a
      )
    );
  };

  // 🚀 Save JSON through local helper server (DEV ONLY)
  const saveToJson = async () => {
    if (isProd) {
      alert("Saving disabled in production.");
      return;
    }

    try {
      const payload = {
        filename: "music.json",
        content: { albums },
      };

      const res = await fetch("http://localhost:4000/api/save-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Write failed");
      }

      alert("Saved locally! Commit + push to deploy.");
    } catch (err) {
      alert("Local save failed: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading music library...
      </div>
    );

  return (
    <div className="text-gray-100 p-6 custom-scroll">
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #ec4899; border-radius: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #111; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-400">🎵 Music Library</h2>

        {editorMode && (
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            onClick={saveToJson}
          >
            Save JSON
          </button>
        )}
      </div>

      {/* Album List */}
      <div className="space-y-8 pb-24">
        {albums.map((album, index) => {
          const isOpen = openAlbums[album.id];

          return (
            <motion.div
              key={album.id}
              layout
              className="border border-gray-800 bg-[#0f0f0f] rounded-xl"
            >
              <div
                className={`flex justify-between items-center px-5 py-4 ${
                  editorMode
                    ? "bg-[#141414]"
                    : "bg-[#141414] cursor-pointer hover:bg-[#1a1a1a]"
                }`}
                onClick={() => toggleAlbum(album.id)}
              >
                <div>
                  {editorMode ? (
                    <>
                      <input
                        value={album.title}
                        className="text-lg font-semibold text-pink-400 bg-transparent border-b border-gray-700"
                        onChange={(e) =>
                          setAlbums((prev) =>
                            prev.map((a) =>
                              a.id === album.id
                                ? { ...a, title: e.target.value }
                                : a
                            )
                          )
                        }
                      />
                      <input
                        value={album.year}
                        className="block text-sm text-gray-400 bg-transparent border-b border-gray-700 mt-1 w-20"
                        onChange={(e) =>
                          setAlbums((prev) =>
                            prev.map((a) =>
                              a.id === album.id
                                ? { ...a, year: e.target.value }
                                : a
                            )
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-pink-400">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-400">{album.year}</p>
                    </>
                  )}
                </div>

                {editorMode ? (
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-pink-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSong(album.id);
                      }}
                    >
                      + Song
                    </button>
                    <button
                      disabled={index === 0}
                      className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAlbum(index, -1);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      disabled={index === albums.length - 1}
                      className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAlbum(index, 1);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlbum(album.id);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                ) : (
                  <span
                    className={`transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                )}
              </div>

              {/* Songs */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="px-5 py-4 space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {album.songs.map((song, songIndex) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between gap-4 border border-gray-800 rounded-lg p-3 bg-[#141414]"
                      >
                        <div
                          className="rounded-lg overflow-hidden"
                          style={{ width: "75%", height: "152px" }}
                          dangerouslySetInnerHTML={{
                            __html: song.spotifyEmbed || "",
                          }}
                        />

                        {editorMode && (
                          <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <button
                              onClick={() => openPanel(album, song)}
                              className="px-3 py-1 text-xs bg-gray-700 rounded"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() =>
                                deleteSong(album.id, song.id)
                              }
                              className="px-3 py-1 text-xs bg-red-600 rounded"
                            >
                              🗑
                            </button>

                            <div className="flex gap-1">
                              <button
                                disabled={songIndex === 0}
                                onClick={() =>
                                  moveSong(album.id, songIndex, -1)
                                }
                                className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-40"
                              >
                                ↑
                              </button>
                              <button
                                disabled={
                                  songIndex === album.songs.length - 1
                                }
                                onClick={() =>
                                  moveSong(album.id, songIndex, 1)
                                }
                                className="px-2 py-1 text-xs bg-gray-700 rounded disabled:opacity-40"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Song Editor Panel */}
      <AnimatePresence>
        {panelOpen && (
          <MusicPanel
            open={panelOpen}
            onClose={closePanel}
            album={selectedAlbum}
            song={selectedSong}
            mode="edit"
            onSaveSong={handleSaveSong}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
