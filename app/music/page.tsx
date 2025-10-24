"use client";

import dynamic from "next/dynamic";
import React from "react";

// ✅ Proper dynamic import — relative to /components folder
const Music = dynamic(() => import("../../components/music.jsx").then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="text-center text-gray-400 py-20">
      Loading music section...
    </div>
  ),
});

export default function MusicPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-10">
      <Music />
    </main>
  );
}
