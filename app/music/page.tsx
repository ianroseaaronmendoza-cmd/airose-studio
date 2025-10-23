"use client";

import React from "react";
import dynamic from "next/dynamic";

// ✅ Correctly load your music component as a client-side module
// This prevents “promise resolves to object” and hydration mismatches.
const Music = dynamic(() => import("../../components/music").then(mod => mod.default), {
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
