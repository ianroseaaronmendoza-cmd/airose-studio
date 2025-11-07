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
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openAlbums, setOpenAlbums] = useState({});

  // Load albums
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await fetch("/api/music/load");
        if (!res.ok) throw new Error("API fetch failed");
        const json = await res.json();
        const albumList = json?.albums || [];
        setAlbums(albumList);
        // 👇 start collapsed by default (public)
        const initialState = {};
        albumList.forEach((a) => (initialState[a.id] = editorMode));
        setOpenAlbums(initialState);
      } catch {
        try {
          const res2 = await fetch("/data/music.json", { cache: "no-store" });
          const json2 = await res2.json();
          const albumList2 = json2?.albums || [];
          setAlbums(albumList2);
          const initialState = {};
          albumList2.forEach((a) => (initialState[a.id] = editorMode));
          setOpenAlbums(initialState);
        } catch {
          setAlbums([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAlbums();
  }, [editorMode]); // refresh open state when editor toggles

  const toggleAlbum = (albumId) => {
    if (editorMode) return; // disable toggle in editor
    setOpenAlbums((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
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
    const newAlbum = {
      id: `alb-${Date.now()}`,
      title: "Untitled Album",
      year: new Date().getFullYear(),
      songs: [],
    };
    setAlbums([...albums, newAlbum]);
    setOpenAlbums((prev) => ({ ...prev, [newAlbum.id]: true }));
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

  const deleteAlbum = (id) => setAlbums(albums.filter((a) => a.id !== id));

  const deleteSong = (albumId, songId) =>
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === albumId
          ? { ...a, songs: a.songs.filter((s) => s.id !== songId) }
          : a
      )
    );

  const moveAlbum = (index, direction) => {
    const updated = [...albums];
    const [moved] = updated.splice(index, 1);
    updated.splice(index + direction, 0, moved);
    setAlbums(updated);
  };

  const moveSong = (albumId, index, direction) => {
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id !== albumId) return a;
        const newSongs = [...a.songs];
        const [moved] = newSongs.splice(index, 1);
        newSongs.splice(index + direction, 0, moved);
        return { ...a, songs: newSongs };
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

  const syncToGitHub = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Sync failed");
      alert("✅ Synced successfully to GitHub!");
    } catch (err) {
      alert("❌ Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const renderSpotify = (embedHtml) =>
    embedHtml ? (
      <div
        className="rounded-lg overflow-hidden"
        style={{ width: "75%", height: "152px" }}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    ) : (
      <div className="text-gray-600 italic text-sm">No embed set</div>
    );

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
        <h2 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
          🎵 Music Library
        </h2>
        <div className="flex gap-3">
          {editorMode && (
            <button
              onClick={addAlbum}
              className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-sm"
            >
              + Album
            </button>
          )}
          <button
            onClick={syncToGitHub}
            disabled={isSyncing}
            className={`px-4 py-2 rounded text-sm ${
              isSyncing ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {isSyncing ? "Syncing..." : "Sync to GitHub"}
          </button>
        </div>
      </div>

      {/* Albums */}
      <div className="space-y-8 pb-24">
        {albums.map((album, index) => {
          const isOpen = openAlbums[album.id];

          return (
            <motion.div
              key={album.id}
              layout
              className="border border-gray-800 bg-[#0f0f0f] rounded-xl shadow-sm overflow-hidden"
            >
              {/* Album Header */}
              <div
                className={`flex justify-between items-center px-5 py-4 ${
                  editorMode
                    ? "bg-[#141414]"
                    : "bg-[#141414] cursor-pointer hover:bg-[#1a1a1a]"
                }`}
                onClick={() => toggleAlbum(album.id)}
              >
                {/* Album Title */}
                <div>
                  {editorMode ? (
                    <>
                      <input
                        type="text"
                        value={album.title}
                        onChange={(e) =>
                          setAlbums((prev) =>
                            prev.map((a) =>
                              a.id === album.id
                                ? { ...a, title: e.target.value }
                                : a
                            )
                          )
                        }
                        className="text-lg font-semibold text-pink-400 bg-transparent border-b border-gray-700 focus:border-pink-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={album.year}
                        onChange={(e) =>
                          setAlbums((prev) =>
                            prev.map((a) =>
                              a.id === album.id
                                ? { ...a, year: e.target.value }
                                : a
                            )
                          )
                        }
                        className="block text-sm text-gray-400 bg-transparent border-b border-gray-700 focus:border-pink-500 focus:outline-none w-20 mt-1"
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

                {/* Controls */}
                {editorMode ? (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addSong(album.id);
                      }}
                      className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-500 rounded"
                    >
                      + Song
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAlbum(index, -1);
                      }}
                      disabled={index === 0}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAlbum(index, 1);
                      }}
                      disabled={index === albums.length - 1}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlbum(album.id);
                      }}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded"
                    >
                      🗑
                    </button>
                  </div>
                ) : (
                  <span
                    className={`transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                )}
              </div>

              {/* Songs List */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 py-4 space-y-4"
                  >
                    {album.songs.length === 0 && (
                      <p className="text-gray-500 italic text-sm">
                        No songs in this album yet.
                      </p>
                    )}
                    {album.songs.map((song, songIndex) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between gap-4 border border-gray-800 rounded-lg p-3 bg-[#141414]"
                      >
                        {renderSpotify(song.spotifyEmbed)}
                        {editorMode && (
                          <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openPanel(album, song)}
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteSong(album.id, song.id)}
                                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 rounded"
                              >
                                🗑
                              </button>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  moveSong(album.id, songIndex, -1)
                                }
                                disabled={songIndex === 0}
                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-40"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() =>
                                  moveSong(album.id, songIndex, 1)
                                }
                                disabled={
                                  songIndex === album.songs.length - 1
                                }
                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-40"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {editorMode && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => addSong(album.id)}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-xs rounded"
                        >
                          + Add Song
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Panel */}
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
