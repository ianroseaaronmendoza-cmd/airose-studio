import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MusicPanel from "./MusicPanel";

export default function MusicViewer({ albums = [], editorMode = false }) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedAlbums, setExpandedAlbums] = useState({}); // track expanded state

  const openPanel = (album, song, mode) => {
    setSelectedAlbum(album);
    setSelectedSong({ ...song, initialMode: mode });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedSong(null);
    setSelectedAlbum(null);
  };

  const toggleAlbum = (albumId) => {
    setExpandedAlbums((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const renderSpotify = (embedHtml) => {
    if (!embedHtml) return null;
    return (
      <div
        className="rounded-lg overflow-hidden w-full sm:w-[75%] max-w-full aspect-[3/1] sm:aspect-[5/1]"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    );
  };

  return (
    <div className="text-gray-100 flex justify-center mt-4 custom-scroll">
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #ec4899; border-radius: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #111; }
        iframe { width: 100%; height: 100%; }
      `}</style>

      <div className="w-full max-w-3xl px-6">
        {albums.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No music data found.</p>
        )}

        <div className="space-y-6">
          {albums.map((album) => {
            const isOpen = editorMode || expandedAlbums[album.id];

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
                  onClick={() => !editorMode && toggleAlbum(album.id)}
                >
                  <div>
                    <h2 className="text-lg font-bold text-pink-400">
                      {album.title}
                    </h2>
                    <p className="text-sm text-gray-400">{album.year}</p>
                  </div>

                  {/* Collapse arrow */}
                  {!editorMode && (
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="text-gray-400 text-lg"
                    >
                      ▼
                    </motion.span>
                  )}
                </div>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="songs"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        y: -10,
                        transition: { duration: 0.35, ease: "easeInOut" },
                      }}
                      className="px-5 py-4 space-y-4"
                    >
                      {album.songs && album.songs.length > 0 ? (
                        album.songs.map((song) => (
                          <motion.div
                            key={song.id}
                            layout
                            className="bg-[#141414] border border-gray-800 rounded-lg p-4 relative"
                          >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              {renderSpotify(song.spotifyEmbed)}

                              <div className="flex flex-col justify-center items-center gap-2 min-w-[120px]">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      openPanel(album, song, "lyrics")
                                    }
                                    className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-500 rounded"
                                  >
                                    Lyrics
                                  </button>
                                  <button
                                    onClick={() =>
                                      openPanel(album, song, "story")
                                    }
                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                                  >
                                    Story
                                  </button>
                                </div>
                                {editorMode && (
                                  <button
                                    onClick={() =>
                                      openPanel(album, song, "edit")
                                    }
                                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">
                          No songs yet.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="pb-24" />

        <AnimatePresence>
          {panelOpen && (
            <MusicPanel
              open={panelOpen}
              onClose={closePanel}
              album={selectedAlbum}
              song={selectedSong}
              editorMode={editorMode}
              mode={selectedSong?.initialMode || "lyrics"}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
