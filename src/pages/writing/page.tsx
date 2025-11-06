import React from "react";
import { Link } from "react-router-dom";

export default function WritingPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-semibold mb-6">Writing</h1>
      <p className="mb-6 text-gray-400">
        Explore different forms of writing: poems, novels, and blogs.
      </p>
      <div className="space-y-4">
        <Link
          to="/writing/poems"
          className="block p-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-pink-400 transition"
        >
          Poems
        </Link>
        <Link
          to="/writing/novels"
          className="block p-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-teal-400 transition"
        >
          Novels
        </Link>
        <Link
          to="/writing/blogs"
          className="block p-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-violet-400 transition"
        >
          Blogs
        </Link>
      </div>
    </div>
  );
}
