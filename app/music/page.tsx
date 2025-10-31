import dynamic from "next/dynamic";
import type { FC } from "react";

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
  const res = await fetch(
    "https://raw.githubusercontent.com/ianroseaaronmendoza-cmd/airose-studio/main/data/music.json",
    { cache: "no-store" }
  );

  const data = await res.json();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-10">
      <Music initialAlbums={data.albums || []} />
    </main>
  );
}
