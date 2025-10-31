import dynamic from "next/dynamic";
import type { FC } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Dynamically import Music component (client-only)
const Music = dynamic<{ initialAlbums: any[] }>(
  () => import("@/components/music.jsx") as Promise<FC<{ initialAlbums: any[] }>>,
  {
    ssr: false,
    loading: () => (
      <div className="text-center text-gray-400 py-20">
        Loading music section...
      </div>
    ),
  }
);

export default async function MusicPage() {
  // ✅ Fetch the latest music data from GitHub
  let data: any = { albums: [] };

  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/ianroseaaronmendoza-cmd/airose-studio/main/data/music.json",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error("⚠️ Failed to fetch music.json:", err);
  }

  // ✅ Pass data to client component
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-10">
      <Music initialAlbums={data.albums || []} />
    </main>
  );
}
