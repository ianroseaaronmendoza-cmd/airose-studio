// src/components/MusicPanel.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicPanelProps {
  open: boolean;
  onClose: () => void;
  album: any;
  song: any;
  editorMode?: boolean;
  mode?: string;
  onSaveSong?: (albumId: string, song: any) => void;
  onSave?: (albumId: string, song: any) => void; // ✅ compatibility alias
}

export default function MusicPanel({
  open,
  onClose,
  album,
  song,
  editorMode = false,
  mode = "view",
  onSaveSong,
  onSave,
}: MusicPanelProps) {
  const [activeTab, setActiveTab] = useState("lyrics");
  const [localSong, setLocalSong] = useState(song || {});
  const [editMode, setEditMode] = useState(mode === "edit");

  useEffect(() => {
    setLocalSong(song || {});
  }, [song]);

  const handleChange = (field: string, value: any) => {
    setLocalSong({ ...localSong, [field]: value });
  };

  const handleSave = () => {
    if (album) {
      if (onSave) onSave(album.id, localSong);
      if (onSaveSong) onSaveSong(album.id, localSong);
      alert("✅ Song saved locally!");
    }
    setEditMode(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#0f0f0f] text-gray-100 w-full sm:w-[450px] h-full shadow-xl overflow-y-auto border-l border-gray-800"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-sm z-20">
              <div>
                <h2 className="text-lg font-bold text-pink-400">
                  {localSong.title || "Untitled Song"}
                </h2>
                <p className="text-sm text-gray-400">
                  {album?.title || "Untitled Album"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-pink-600 hover:bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 pb-40 space-y-6">
              {localSong.spotifyEmbed ? (
                <div
                  className="rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: localSong.spotifyEmbed }}
                />
              ) : (
                <div className="text-gray-500 italic">
                  No Spotify embed added yet.
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setActiveTab("lyrics")}
                  className={`px-3 py-1 rounded ${
                    activeTab === "lyrics"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Lyrics
                </button>
                <button
                  onClick={() => setActiveTab("story")}
                  className={`px-3 py-1 rounded ${
                    activeTab === "story"
                      ? "bg-pink-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Story
                </button>

                {editorMode && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm ml-auto"
                  >
                    Edit
                  </button>
                )}
              </div>

              {!editMode && (
                <div className="text-sm leading-relaxed whitespace-pre-line border-t border-gray-800 pt-3">
                  {activeTab === "lyrics" ? (
                    <div className="text-gray-200">
                      {localSong.lyrics || (
                        <span className="text-gray-500 italic">
                          No lyrics provided.
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-200">
                      {localSong.story || (
                        <span className="text-gray-500 italic">
                          No story provided.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {editMode && (
                <div className="space-y-5 border-t border-gray-800 pt-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={localSong.title || ""}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Spotify Embed (iframe or URL)
                    </label>
                    <textarea
                      value={localSong.spotifyEmbed || ""}
                      onChange={(e) =>
                        handleChange("spotifyEmbed", e.target.value)
                      }
                      rows={3}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Lyrics
                    </label>
                    <textarea
                      value={localSong.lyrics || ""}
                      onChange={(e) => handleChange("lyrics", e.target.value)}
                      rows={10}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Story
                    </label>
                    <textarea
                      value={localSong.story || ""}
                      onChange={(e) => handleChange("story", e.target.value)}
                      rows={10}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                    />
                  </div>

                  {/* Save + Close */}
                  <div className="flex justify-end gap-2 pt-6 mt-4 border-t border-gray-800">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded text-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
