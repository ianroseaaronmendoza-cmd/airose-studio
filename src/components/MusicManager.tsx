import React, { useEffect, useState } from "react";
import { loadMusic, saveMusic, MusicFile, Album, Song } from "../client/api/music";
import MusicPanel from "./MusicPanel";
import MusicToolbar from "./MusicToolbar";
import { motion, AnimatePresence } from "framer-motion";

export default function MusicManager() {
  //
  // Properly typed states
  //
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const [showPanel, setShowPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  //
  // Load music.json on mount
  //
  useEffect(() => {
    const load = async () => {
      const data: MusicFile = await loadMusic();
      setAlbums(data.albums || []);
      setLoading(false);
    };

    load();
  }, []);

  //
  // Open side panel for album or song
  //
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

  //
  // Create new album
  //
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

  //
  // Create new song
  //
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

  //
  // Update album or song fields
  //
  const updateItem = (
    albumId: string,
    songId: string | null,
    updatedData: Partial<Album> | Partial<Song>
  ) => {
    setAlbums((prevAlbums) =>
      prevAlbums.map((album) => {
        if (album.id !== albumId) return album;

        // Update album
        if (songId === null) {
          return { ...album, ...(updatedData as Partial<Album>) };
        }

        // Update a song
        const updatedSongs = album.songs.map((song) =>
          song.id === songId
            ? { ...song, ...(updatedData as Partial<Song>) }
            : song
        );

        return { ...album, songs: updatedSongs };
      })
    );
  };

  //
  // Delete album
  //
  const deleteAlbum = (albumId: string) => {
    if (!confirm("Delete this album?")) return;

    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  };

  //
  // Delete song
  //
  const deleteSong = (albumId: string, songId: string) => {
    if (!confirm("Delete this song?")) return;

    setAlbums((prevAlbums) =>
      prevAlbums.map((album) => {
        if (album.id !== albumId) return album;
        return { ...album, songs: album.songs.filter((s) => s.id !== songId) };
      })
    );
  };

  //
  // Save everything to music.json
  //
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

  //
  // UI
  //
  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading music...
      </div>
    );
  }

  return (
    <div className="w-full text-gray-100 space-y-6 pb-20">
      {/* Toolbar */}
      <MusicToolbar onAddAlbum={addAlbum} onSave={handleSaveAll} saving={saving} />

      <div className="space-y-8">
        {albums.length === 0 && (
          <p className="text-gray-400">No albums yet. Add one above.</p>
        )}

        {albums.map((album) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{album.title}</h2>
                {album.year && (
                  <p className="text-gray-500 text-sm">{album.year}</p>
                )}
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
              {album.songs.map((song) => (
                <div
                  key={song.id}
                  className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg"
                >
                  <p className="font-medium">{song.title}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPanel(album, song)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteSong(album.id, song.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
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

      {/* Side Panel */}
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
