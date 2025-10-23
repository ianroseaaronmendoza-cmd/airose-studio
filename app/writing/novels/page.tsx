// app/writing/novels/page.tsx
import Link from "next/link";
import { novels } from "../../../data/writings";

export default function NovelsPage() {
  const safeNovels = Array.isArray(novels) ? novels : [];

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Novels</h1>

      {safeNovels.length === 0 ? (
        <p className="text-gray-400">No novels found.</p>
      ) : (
        <div className="space-y-6">
          {safeNovels.map((n) => (
            <article key={n.slug} className="p-6 bg-gray-900 rounded-lg">
              <h2 className="text-xl font-semibold mb-1">
                <Link href={`/writing/novels/${n.slug}`}>{n.title}</Link>
              </h2>
              <p className="text-xs text-gray-500 mb-3">{n.description}</p>

              <div className="text-sm text-gray-400">
                Chapters: {Array.isArray(n.chapters) ? n.chapters.length : 0} •{" "}
                <Link className="text-pink-400" href={`/writing/novels/${n.slug}`}>
                  Read overview
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}