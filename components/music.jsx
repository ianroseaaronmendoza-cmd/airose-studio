"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "@/app/context/EditorContext";

/* =====================================
   MUSIC COMPONENT (FULL VERSION)
   ===================================== */

export default function Music() {
  const { editorMode } = useEditor();

  const [albums, setAlbums] = useState([]);
  const [local, setLocal] = useState([]);
  const [deleted, setDeleted] = useState({ albums: [], songs: {} });
  const [openAlbumId, setOpenAlbumId] = useState(null);
  const [activeSong, setActiveSong] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const undoRef = useRef(null);

  /* =========================
     Backend / Local Loading
     ========================= */
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/music/load");
      const data = await res.json();
      setAlbums(data.albums || []);
    })();
  }, []);

  function syncToServer(updatedAlbums) {
    fetch("/api/music/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albums: updatedAlbums }),
    }).catch(() => {});
  }

  /* =========================
     Album CRUD
     ========================= */
  function createAlbum(title = "Untitled Album") {
    const newAlbum = {
      id: `alb-${Date.now()}`,
      title,
      year: new Date().getFullYear(),
      type: "album",
      cover: "",
      songs: [],
    };
    const updated = [...albums, newAlbum];
    setAlbums(updated);
    syncToServer(updated);
    setToast({ message: "Album created" });
  }

  function createSingle(title = "Untitled Single") {
    const newAlbum = {
      id: `single-${Date.now()}`,
      title,
      year: new Date().getFullYear(),
      type: "single",
      cover: "",
      songs: [],
    };
    const updated = [...albums, newAlbum];
    setAlbums(updated);
    syncToServer(updated);
    setToast({ message: "Single created" });
  }

  function deleteAlbum(albumId) {
    const updated = albums.filter((a) => a.id !== albumId);
    setAlbums(updated);
    syncToServer(updated);
    setToast({ message: "Album deleted" });
  }

  function toggleAlbum(id) {
    setOpenAlbumId((prev) => (prev === id ? null : id));
  }

  /* =========================
     Song CRUD
     ========================= */
  function createSong(albumId) {
    const updated = albums.map((a) => {
      if (a.id === albumId) {
        const newSong = {
          id: `song-${Date.now()}`,
          title: "Untitled",
          embed: "",
          story: "",
          lyrics: "",
        };
        return { ...a, songs: [...a.songs, newSong] };
      }
      return a;
    });
    setAlbums(updated);
    syncToServer(updated);
  }

  function deleteSong(albumId, songId) {
    const updated = albums.map((a) =>
      a.id === albumId
        ? { ...a, songs: a.songs.filter((s) => s.id !== songId) }
        : a
    );
    setAlbums(updated);
    syncToServer(updated);
  }

  function moveSong(albumId, songId, direction) {
    const updated = albums.map((a) => {
      if (a.id === albumId) {
        const arr = [...a.songs];
        const idx = arr.findIndex((s) => s.id === songId);
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= arr.length) return a;
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...a, songs: arr };
      }
      return a;
    });
    setAlbums(updated);
    syncToServer(updated);
  }

  /* =========================
     Album Editing
     ========================= */
  function startAlbumEdit(albumId) {
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, _editing: true } : a))
    );
  }

  function handleAlbumEditChange(albumId, field, value) {
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, [field]: value } : a))
    );
  }

  function cancelAlbumEdit(albumId) {
    setAlbums((prev) =>
      prev.map((a) => (a.id === albumId ? { ...a, _editing: false } : a))
    );
  }

  function saveAlbumEdit(albumId) {
    const updatedAlbum = albums.find((a) => a.id === albumId);
    if (!updatedAlbum) return;

    const updated = albums.map((a) =>
      a.id === albumId ? { ...updatedAlbum, _editing: false } : a
    );
    setAlbums(updated);
    syncToServer(updated);
    setToast({ message: "Album updated" });
  }

  /* =========================
     Song Panel & Editing
     ========================= */
  function openStoryPanel(song) {
    setActiveSong(song);
    document.documentElement.style.overflow = "hidden";
  }

  function closeStoryPanel() {
    setActiveSong(null);
    document.documentElement.style.overflow = "";
  }

  /* =========================
     Render Helpers
     ========================= */
  const renderPlayback = (song) => (
    song.embed ? (
      <div dangerouslySetInnerHTML={{ __html: song.embed }} />
    ) : (
      <div className="text-gray-500 text-sm">No playable source</div>
    )
  );

  /* =========================
     MAIN RENDER
     ========================= */
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-gray-100">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Music</h1>
          <p className="text-sm opacity-70">
            Songs & stories — Airose listening diary.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => createAlbum()}
              className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
            >
              + Album
            </button>
            <button
              onClick={() => createSingle()}
              className="bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm"
            >
              + Single
            </button>
            <button
              onClick={() => createSong(null)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
            >
              + Song
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Editor Mode: {editorMode ? "ON" : "OFF"}
          </div>
        </div>
      </header>

      {/* Albums */}
      <div className="flex flex-col gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          >
            {/* Album Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleAlbum(album.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-sm">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-xs opacity-80">
                      {(album.songs || []).length} tracks
                    </span>
                  )}
                </div>

                <div>
                  {album._editing ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={album.title || ""}
                        onChange={(e) =>
                          handleAlbumEditChange(album.id, "title", e.target.value)
                        }
                        className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={album.year || ""}
                          onChange={(e) =>
                            handleAlbumEditChange(album.id, "year", e.target.value)
                          }
                          className="w-20 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Cover image URL"
                          value={album.cover || ""}
                          onChange={(e) =>
                            handleAlbumEditChange(album.id, "cover", e.target.value)
                          }
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            saveAlbumEdit(album.id);
                          }}
                          className="px-2 py-1 bg-green-600 rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            cancelAlbumEdit(album.id);
                          }}
                          className="px-2 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-lg">{album.title}</div>
                      <div className="text-xs opacity-70">
                        {album.year} • {album.type === "single" ? "Single" : "Album"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {editorMode && (
                <div className="flex items-center gap-2">
                  {!album._editing && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        startAlbumEdit(album.id);
                      }}
                      className="px-2 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      createSong(album.id);
                    }}
                    className="px-2 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
                  >
                    + Song
                  </button>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      deleteAlbum(album.id);
                    }}
                    className="px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Songs */}
            <AnimatePresence>
              {openAlbumId === album.id && (
                <motion.div
                  key="songs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="space-y-4">
                    {album.songs.map((song) => (
                      <div
                        key={song.id}
                        className="bg-neutral-800/50 rounded-xl p-3"
                      >
                        <div className="md:flex md:items-start md:gap-4">
                          <div className="rounded-md overflow-hidden flex-1">
                            {renderPlayback(song)}
                          </div>
                          <div className="mt-3 md:mt-0 md:w-44">
                            <div className="font-medium">{song.title}</div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <button
                                onClick={() => openStoryPanel(song)}
                                className="px-3 py-1 rounded-md bg-pink-500/80 hover:bg-pink-500 text-black text-sm"
                              >
                                Story
                              </button>
                              <button
                                onClick={() => setShowLyrics(true)}
                                className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-800"
                              >
                                Lyrics
                              </button>
                            </div>
                            {editorMode && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button
                                  onClick={() => moveSong(album.id, song.id, "up")}
                                  className="px-2 py-1 bg-gray-700 rounded text-sm"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => moveSong(album.id, song.id, "down")}
                                  className="px-2 py-1 bg-gray-700 rounded text-sm"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={() => deleteSong(album.id, song.id)}
                                  className="px-2 py-1 bg-red-600 rounded text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-neutral-900/95 border border-neutral-800 p-3 rounded-md shadow"
            >
              <div className="text-sm">{toast.message}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
