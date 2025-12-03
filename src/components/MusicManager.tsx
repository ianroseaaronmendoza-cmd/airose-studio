import React, { useEffect, useState } from "react";
import { loadMusic, saveMusic, MusicFile, Album, Song } from "../client/api/music";
import MusicPanel from "./MusicPanel";
import MusicToolbar from "./MusicToolbar";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function MusicManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data: MusicFile = await loadMusic();
      setAlbums(data.albums || []);
      setLoading(false);
    };

    load();
  }, []);

  const openPanel = (album: Album | null, song: Song | null) => {
    setSelectedAlbum(album);
    setSelectedSong(song);
    setShowPanel(true);
  };

  const closePanel = () => {
    setSelectedAlbum(null);
    setSelectedSong(null);
    setShowPanel(false);
  };

  const addAlbum = () => {
    const id = "alb-" + Date.now();
    const newAlbum: Album = {
      id,
      title: "Untitled Album",
      year: "",
      songs: [],
    };

    setAlbums((prev) => [...prev, newAlbum]);
    openPanel(newAlbum, null);
  };

  const addSong = (albumId: string) => {
    const id = "song-" + Date.now();
    const newSong: Song = {
      id,
      title: "New Song",
      spotifyEmbed: "",
      lyrics: "",
      story: "",
    };

    setAlbums((prevAlbums) =>
      prevAlbums.map((alb) =>
        alb.id === albumId
          ? { ...alb, songs: [...alb.songs, newSong] }
          : alb
      )
    );

    const album = albums.find((a) => a.id === albumId) || null;
    openPanel(album, newSong);
  };

  const updateItem = (
    albumId: string,
    songId: string | null,
    updatedData: Partial<Album> | Partial<Song>
  ) => {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) => {
        if (album.id !== albumId) return album;

        if (songId === null) {
          return { ...album, ...(updatedData as Partial<Album>) };
        }

        const updatedSongs = album.songs.map((song) =>
          song.id === songId
            ? { ...song, ...(updatedData as Partial<Song>) }
            : song
        );

        return { ...album, songs: updatedSongs };
      })
    );
  };

  const deleteAlbum = (albumId: string) => {
    if (!confirm("Delete this album?")) return;
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  };

  const deleteSong = (albumId: string, songId: string) => {
    if (!confirm("Delete this song?")) return;

    setAlbums((prevAlbums) =>
      prevAlbums.map((album) => {
        if (album.id !== albumId) return album;
        return { ...album, songs: album.songs.filter((s) => s.id !== songId) };
      })
    );
  };

  // ✅ NEW: Move album up/down
  const moveAlbum = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= albums.length) return;

    const newAlbums = [...albums];
    [newAlbums[index], newAlbums[newIndex]] = [newAlbums[newIndex], newAlbums[index]];
    setAlbums(newAlbums);
  };

  // ✅ NEW: Move song up/down within an album
  const moveSong = (albumId: string, songIndex: number, direction: "up" | "down") => {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) => {
        if (album.id !== albumId) return album;

        const songs = [...album.songs];
        const newIndex = direction === "up" ? songIndex - 1 : songIndex + 1;
        if (newIndex < 0 || newIndex >= songs.length) return album;

        [songs[songIndex], songs[newIndex]] = [songs[newIndex], songs[songIndex]];
        return { ...album, songs };
      })
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await saveMusic({ albums });
      alert("Saved to music.json!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading music...
      </div>
    );
  }

  return (
    <div className="w-full text-gray-100 space-y-6 pb-20">
      <MusicToolbar onAddAlbum={addAlbum} onSave={handleSaveAll} saving={saving} />

      <div className="space-y-8">
        {albums.length === 0 && (
          <p className="text-gray-400">No albums yet. Add one above.</p>
        )}

        {albums.map((album, albumIndex) => (
          <motion.div
            key={album.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {/* ✅ Album Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveAlbum(albumIndex, "up")}
                    disabled={albumIndex === 0}
                    className="p-1 hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move album up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveAlbum(albumIndex, "down")}
                    disabled={albumIndex === albums.length - 1}
                    className="p-1 hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move album down"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold">{album.title}</h2>
                  {album.year && (
                    <p className="text-gray-500 text-sm">{album.year}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openPanel(album, null)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Edit Album
                </button>

                <button
                  onClick={() => deleteAlbum(album.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Delete Album
                </button>
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-800 pt-4">
              {album.songs.map((song, songIndex) => (
                <div
                  key={song.id}
                  className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* ✅ Song Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSong(album.id, songIndex, "up")}
                        disabled={songIndex === 0}
                        className="p-1 hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move song up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveSong(album.id, songIndex, "down")}
                        disabled={songIndex === album.songs.length - 1}
                        className="p-1 hover:bg-neutral-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move song down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <p className="font-medium">{song.title}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPanel(album, song)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteSong(album.id, song.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addSong(album.id)}
                className="w-full py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg mt-2"
              >
                + Add Song
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showPanel && (
          <MusicPanel
            album={selectedAlbum}
            song={selectedSong}
            onClose={closePanel}
            onUpdate={updateItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
