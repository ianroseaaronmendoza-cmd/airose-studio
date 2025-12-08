import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Track {
  id?: string;
  title: string;
  duration?: string;
  lyrics?: string;
  story?: string;
  file?: string;
  spotifyEmbed?: string;
}

interface Album {
  id: string;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  year?: string;
  tracks?: Track[];
  songs?: Track[];
}

interface MusicViewerProps {
  albums: Album[];
}

export default function MusicViewer({ albums }: MusicViewerProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<"lyrics" | "story">("lyrics");

  // Auto-expand all albums on mount (preview mode)
  useEffect(() => {
    if (albums.length > 0) {
      const expanded: Record<string, boolean> = {};
      albums.forEach((album) => {
        expanded[album.id] = false; // <-- collapsed by default
      });
      setExpandedAlbums(expanded);
    }
  }, [albums]);

  const openPanel = (song: Track, mode: "lyrics" | "story") => {
    setSelectedTrack(song);
    setActiveView(mode);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedTrack(null);
  };

  const toggleAlbum = (albumId: string) => {
    setExpandedAlbums((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const renderSpotify = (embedHtml: string, isCompact = false) => {
    if (!embedHtml) return null;
    return (
      <div
        className={`rounded-lg overflow-hidden w-full ${
          isCompact ? "aspect-[4/1]" : "sm:w-[75%] w-full aspect-[3/1] sm:aspect-[5/1]"
        }`}
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    );
  };

  return (
    <div className="relative text-gray-100 flex justify-center mt-4 custom-scroll">
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #ec4899; border-radius: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #111; }
        iframe { width: 100%; height: 100%; }
        
        /* Glass hover effect */
        .glass-hover {
          position: relative;
          overflow: hidden;
        }
        .glass-hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s ease;
          pointer-events: none;
          z-index: 1;
        }
        .glass-hover:hover::before {
          left: 100%;
        }

        /* Glass effect for side panel */
        .panel-glass-enter::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: panelGlassSlide 1.2s ease-out;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes panelGlassSlide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="w-full px-6">
        {albums.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No music data found.</p>
        )}

        <div className="space-y-6">
          {albums.map((album) => {
            const isOpen = expandedAlbums[album.id];
            const albumTracks = album.tracks || album.songs || [];

            return (
              <motion.div
                key={album.id}
                layout
                className="border border-gray-800 bg-[#0f0f0f] rounded-xl shadow-sm overflow-hidden"
              >
                {/* Album Header */}
                <div
                  className="flex justify-between items-center px-5 py-4 bg-[#141414] cursor-pointer hover:bg-[#1a1a1a]"
                  onClick={() => toggleAlbum(album.id)}
                >
                  <div>
                    <h2 className="text-lg font-bold text-pink-400">
                      {album.title}
                    </h2>
                    <p className="text-sm text-gray-400">{album.year}</p>
                  </div>

                  {/* Collapse arrow */}
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-gray-400 text-lg"
                  >
                    ▼
                  </motion.span>
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
                      {albumTracks.length > 0 ? (
                        albumTracks.map((song) => (
                          <motion.div
                            key={song.id}
                            layout
                            className="bg-[#141414] border border-gray-800 rounded-lg p-4 relative glass-hover"
                          >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              {song.spotifyEmbed && renderSpotify(song.spotifyEmbed)}

                              <div className="flex flex-col justify-center items-center gap-2 min-w-[120px]">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openPanel(song, "lyrics")}
                                    className="px-3 py-1 text-xs bg-pink-600 hover:bg-pink-500 rounded transition"
                                  >
                                    Lyrics
                                  </button>
                                  <button
                                    onClick={() => openPanel(song, "story")}
                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                                  >
                                    Story
                                  </button>
                                </div>
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

        {/* Side Panel - For viewing Lyrics/Story */}
        <AnimatePresence>
          {panelOpen && selectedTrack && (
            <>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-2/5 bg-neutral-900 border-l border-neutral-800 shadow-2xl z-50 overflow-hidden panel-glass-enter"
              >
                {/* Scrollable content wrapper */}
                <div className="h-full overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between z-10">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-pink-400">
                        {selectedTrack.title}
                      </h3>
                    </div>
                    <button
                      onClick={closePanel}
                      className="p-2 hover:bg-neutral-800 rounded text-gray-400"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Spotify Embed - Compact Version */}
                  {selectedTrack.spotifyEmbed && (
                    <div className="px-6 pt-4">
                      {renderSpotify(selectedTrack.spotifyEmbed, true)}
                    </div>
                  )}

                  {/* Toggle Buttons */}
                  <div className="px-6 py-4 flex gap-2 border-b border-neutral-800">
                    <button
                      onClick={() => setActiveView("lyrics")}
                      className={`flex-1 px-4 py-2 rounded text-sm font-medium transition ${
                        activeView === "lyrics"
                          ? "bg-pink-600 text-white"
                          : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                      }`}
                    >
                      Lyrics
                    </button>
                    <button
                      onClick={() => setActiveView("story")}
                      className={`flex-1 px-4 py-2 rounded text-sm font-medium transition ${
                        activeView === "story"
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                      }`}
                    >
                      Story
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 pb-32">
                    {activeView === "lyrics" && (
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                          {selectedTrack.lyrics || "No lyrics available."}
                        </pre>
                      </div>
                    )}

                    {activeView === "story" && (
                      <div className="prose prose-invert max-w-none">
                        <div
                          className="text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: selectedTrack.story || "<p>No story available.</p>",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={closePanel}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
