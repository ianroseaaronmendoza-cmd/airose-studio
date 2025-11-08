import React from "react";

interface MusicToolbarProps {
  onAddAlbum: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export default function MusicToolbar({
  onAddAlbum,
  onSync,
  isSyncing,
}: MusicToolbarProps) {
  return (
    <div className="flex items-center justify-between max-w-5xl mx-auto border-b border-gray-800 pb-4">
      <h1 className="text-2xl font-bold text-pink-400 flex items-center gap-2">
        🎵 Music Library
      </h1>

      <div className="flex items-center gap-3">
        {/* Add Album Button */}
        <button
          onClick={onAddAlbum}
          className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-500 text-sm transition"
        >
          + Album
        </button>

        {/* Sync Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded text-sm transition ${
            isSyncing
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-gray-800 hover:bg-gray-700 text-gray-100"
          }`}
        >
          {isSyncing ? "Syncing..." : "Sync to GitHub"}
        </button>
      </div>
    </div>
  );
}
