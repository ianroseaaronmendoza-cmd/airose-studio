// app/writing/page.tsx
"use client";
import Link from "next/link";

export default function WritingHome() {
  return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">My Writings</h1>
      <p className="text-gray-400 mb-8">
        Explore my poems, novels, and blog entries.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/writing/poems" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
          Poems
        </Link>
        <Link href="/writing/novels" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
          Novels
        </Link>
        <Link href="/writing/blogs" className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
          Blogs
        </Link>
      </div>
    </div>
  );
}
