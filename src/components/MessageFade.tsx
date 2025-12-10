import React from "react";
export default function MessageFade({ text, user }: { text: string; user: string }) {
  return (
    <div className="mb-2 px-4 py-2 bg-neutral-800 rounded text-gray-100 opacity-80 transition-opacity duration-700">
      <span className="font-semibold text-pink-400">{user.slice(0, 6)}:</span> {text}
    </div>
  );
}