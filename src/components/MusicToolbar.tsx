import React from "react";

interface MusicToolbarProps {
  onAddAlbum: () => void;
  onSave: () => void;
  saving: boolean;
}

export default function MusicToolbar({ onAddAlbum, onSave, saving }: MusicToolbarProps) {
  return (
    <div className="flex justify-between items-center py-4 px-2">
      <button
        onClick={onAddAlbum}
        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
      >
        + Add Album
      </button>

      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:opacity-50 text-white rounded-lg"
      >
        {saving ? "Saving..." : "Save All"}
      </button>
    </div>
  );
}
