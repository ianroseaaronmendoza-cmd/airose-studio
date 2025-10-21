"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <h1 className="text-xl font-bold tracking-wide text-white">
          Airose Studio
        </h1>

        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#" className="hover:text-pink-400 transition">Home</a>
          <a href="#" className="hover:text-pink-400 transition">Music</a>
          <a href="#" className="hover:text-pink-400 transition">Projects</a>
          <a href="#" className="hover:text-pink-400 transition">Writing</a>
          <a href="#" className="hover:text-pink-400 transition">About</a>
          <a href="#" className="hover:text-pink-400 transition">Support</a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-pink-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center bg-[#0a0a0a] border-b border-gray-800 pb-4">
          {["Home", "Music", "Projects", "Writing", "About", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="py-2 text-gray-300 hover:text-pink-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-grow px-6 py-20">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Where imagination becomes craft.
        </h2>
        <p className="text-gray-400 max-w-xl">
          Welcome to Airose Studio — a creative space where music, tools, and stories come to life.
        </p>
        <div className="mt-8 flex space-x-4">
          <a
            href="#projects"
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            Explore Projects
          </a>
          <a
            href="#music"
            className="border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            Listen to Music
          </a>
        </div>
      </section>

      {/* Featured Sections */}
      <section id="projects" className="px-6 py-16 border-t border-gray-800 bg-[#0d0d0d]">
        <h3 className="text-2xl font-bold mb-6 text-white">✨ Featured Projects</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Airose Lyric Video Maker", desc: "Create lyric videos effortlessly." },
            { title: "Airose Harmony Trainer", desc: "Learn and practice vocal harmonies." },
            { title: "Airose Refiner Mini", desc: "Timestamp and sync lyrics with precision." },
          ].map((proj) => (
            <div
              key={proj.title}
              className="p-5 bg-[#111] rounded-2xl border border-gray-800 hover:border-pink-400 transition"
            >
              <h4 className="font-semibold text-lg text-pink-400">{proj.title}</h4>
              <p className="text-sm text-gray-400 mt-2">{proj.desc}</p>
              <button className="mt-4 text-sm text-gray-300 hover:text-pink-400">View →</button>
            </div>
          ))}
        </div>
      </section>

      <section id="music" className="px-6 py-16 border-t border-gray-800">
        <h3 className="text-2xl font-bold mb-6 text-white">🎵 Featured Music</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-pink-400 font-semibold">Ikaw lang, Hesus</p>
            <iframe
              className="mt-3 rounded-lg"
              width="100%"
              height="120"
              src="https://open.spotify.com/embed/track/3Zy6gYZZ..."
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            ></iframe>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
            <p className="text-pink-400 font-semibold">Walang Hanggan</p>
            <p className="text-gray-400 mt-2 text-sm">
              Coming soon on Spotify.
            </p>
          </div>
        </div>
      </section>

      <section id="writing" className="px-6 py-16 border-t border-gray-800 bg-[#0d0d0d]">
        <h3 className="text-2xl font-bold mb-6 text-white">🖋 Writing</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-pink-400 font-semibold">Poems</h4>
            <p className="text-gray-400 text-sm">A collection of reflections and lyrical thoughts.</p>
          </div>
          <div>
            <h4 className="text-pink-400 font-semibold">Novels</h4>
            <p className="text-gray-400 text-sm">Stories inspired by music and imagination.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        <p>© 2025 Airose Studio | Built with ❤️ and purpose.</p>
        <div className="mt-3 flex justify-center space-x-5 text-gray-400">
          <a href="#" className="hover:text-pink-400">Instagram</a>
          <a href="#" className="hover:text-pink-400">YouTube</a>
          <a href="#" className="hover:text-pink-400">Spotify</a>
          <a href="#" className="hover:text-pink-400">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
