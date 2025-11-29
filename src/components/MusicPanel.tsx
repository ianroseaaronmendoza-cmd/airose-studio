import React, { useState } from "react";
import { Album, Song } from "../client/api/music";

interface MusicPanelProps {
  album: Album | null;
  song: Song | null;
  onClose: () => void;
  onUpdate: (
    albumId: string,
    songId: string | null,
    updatedData: Partial<Album> | Partial<Song>
  ) => void;
}

export default function MusicPanel({
  album,
  song,
  onClose,
  onUpdate,
}: MusicPanelProps) {
  const isEditingAlbum = song == null;

  const [localData, setLocalData] = useState<Partial<Album> & Partial<Song>>(
  (song as Song) || (album as Album) || {}
);


  const handleChange = (field: string, value: any) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!album) return;

    if (isEditingAlbum) {
      onUpdate(album.id, null, localData);
    } else {
      onUpdate(album.id, (song as Song).id, localData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full sm:w-[450px] bg-neutral-900 border-l border-neutral-700 p-6 overflow-y-auto">

        <h1 className="text-xl font-bold text-white mb-4">
          {isEditingAlbum ? "Edit Album" : "Edit Song"}
        </h1>

        <div className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-gray-400 mb-1 text-sm">Title</label>
            <input
              value={localData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded"
            />
          </div>

          {/* Album Year */}
          {isEditingAlbum && (
            <div>
              <label className="block text-gray-400 mb-1 text-sm">Year</label>
              <input
                value={(localData as Album).year || ""}
                onChange={(e) => handleChange("year", e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded"
              />
            </div>
          )}

          {/* Song Embed */}
          {!isEditingAlbum && (
            <>
              <div>
                <label className="block text-gray-400 mb-1 text-sm">
                  Spotify Embed
                </label>
                <textarea
                  rows={3}
                  value={(localData as Song).spotifyEmbed || ""}
                  onChange={(e) =>
                    handleChange("spotifyEmbed", e.target.value)
                  }
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">Lyrics</label>
                <textarea
                  rows={6}
                  value={(localData as Song).lyrics || ""}
                  onChange={(e) => handleChange("lyrics", e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 text-sm">Story</label>
                <textarea
                  rows={6}
                  value={(localData as Song).story || ""}
                  onChange={(e) => handleChange("story", e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 px-3 py-2 rounded"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
