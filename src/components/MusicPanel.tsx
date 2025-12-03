import React, { useState, useEffect } from "react";
import { Album, Song } from "../client/api/music";
import { X } from "lucide-react";

interface MusicPanelProps {
  album: Album | null;
  song: Song | null;
  onClose: () => void;
  onUpdate: (albumId: string, songId: string | null, data: any) => void;
}

export default function MusicPanel({
  album,
  song,
  onClose,
  onUpdate,
}: MusicPanelProps) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [spotifyEmbed, setSpotifyEmbed] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [story, setStory] = useState("");

  useEffect(() => {
    if (song) {
      setTitle(song.title || "");
      setSpotifyEmbed(song.spotifyEmbed || "");
      setLyrics(song.lyrics || "");
      setStory(song.story || "");
    } else if (album) {
      setTitle(album.title || "");
      setYear(album.year ? String(album.year) : "");
    }
  }, [album, song]);

  const handleSave = () => {
    if (!album) return;

    if (song) {
      onUpdate(album.id, song.id, {
        title,
        spotifyEmbed,
        lyrics,
        story,
      });
    } else {
      onUpdate(album.id, null, {
        title,
        year,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full md:w-1/2 lg:w-1/3 bg-neutral-900 border-l border-neutral-800 shadow-2xl overflow-y-auto">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-pink-400">
            {song ? "Edit Song" : "Edit Album"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - All in flow */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {song ? "Song Title" : "Album Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:border-pink-500"
              placeholder="Enter title..."
            />
          </div>

          {/* Album Year (only for albums) */}
          {!song && (
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:border-pink-500"
                placeholder="e.g., 2024"
              />
            </div>
          )}

          {/* Song-specific fields */}
          {song && (
            <>
              {/* Spotify Embed */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Spotify Embed Code
                </label>
                <textarea
                  value={spotifyEmbed}
                  onChange={(e) => setSpotifyEmbed(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:border-pink-500 font-mono text-xs resize-none"
                  placeholder='<iframe src="..." ...></iframe>'
                />
              </div>

              {/* Lyrics */}
              <div>
                <label className="block text-sm font-medium mb-2">Lyrics</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:border-pink-500 resize-none"
                  placeholder="Enter lyrics..."
                />
              </div>

              {/* Story */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story (HTML supported)
                </label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-gray-100 focus:outline-none focus:border-pink-500 resize-none"
                  placeholder="Enter the story behind the song..."
                />
              </div>
            </>
          )}

          {/* Buttons - Static in flow */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded text-white font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-gray-300"
            >
              Cancel
            </button>
          </div>

          {/* Extra padding so you can scroll past the main footer */}
          <div className="h-32"></div>
        </div>
      </div>
    </div>
  );
}
