"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-lg z-50">
        <h1 className="text-xl font-bold tracking-wide text-white">
          Airose Studio
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/music">Music</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/about">About</Link>
          <Link href="/support">Support</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col items-center py-4 space-y-2 bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-gray-800">
          <Link href="/">Home</Link>
          <Link href="/music">Music</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/about">About</Link>
          <Link href="/support">Support</Link>
        </nav>
      )}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-grow py-20 px-6">
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
          Where imagination becomes craft.
        </h2>
        <p className="text-gray-400 max-w-xl mb-8">
          Welcome to Airose Studio — a creative space where music, tools, and
          stories come to life.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/projects"
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Explore Projects
          </Link>
          <Link
            href="/music"
            className="border border-pink-500 hover:bg-pink-500/20 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Listen to Music
          </Link>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="bg-[#0f0f0f] py-16 px-6">
        <h3 className="text-2xl font-bold mb-10 text-white">
          ✨ Featured Projects
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg">
            <h4 className="text-pink-400 font-bold mb-2">
              Airose Lyric Video Maker
            </h4>
            <p className="text-gray-400 mb-3">Create lyric videos effortlessly.</p>
            <Link href="/projects/lyric-video-maker" className="text-pink-400">
              View →
            </Link>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg">
            <h4 className="text-pink-400 font-bold mb-2">
              Airose Harmony Trainer
            </h4>
            <p className="text-gray-400 mb-3">
              Learn and practice vocal harmonies.
            </p>
            <Link href="/projects/harmony-trainer" className="text-pink-400">
              View →
            </Link>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg">
            <h4 className="text-pink-400 font-bold mb-2">
              Airose Refiner Mini
            </h4>
            <p className="text-gray-400 mb-3">
              Timestamp and sync lyrics with precision.
            </p>
            <Link href="/projects/refiner-mini" className="text-pink-400">
              View →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800 py-8 text-center">
        <p className="text-sm text-gray-400">© 2025 Airose Studio. All Rights Reserved.</p>
        <div className="mt-4 flex justify-center gap-6 text-gray-400">
          <Link href="https://www.instagram.com/airose_official/" target="_blank">
            Instagram
          </Link>
          <Link href="https://www.youtube.com/@AiroseOfficial" target="_blank">
            YouTube
          </Link>
          <Link href="https://open.spotify.com/artist/7siLh2Wz78DXsMBsS3HRGG?si=a8fc159d713c4648" target="_blank">
            Spotify
          </Link>
          <Link href="https://www.wattpad.com/user/Mazedon" target="_blank">
            Wattpad
          </Link>
        </div>
      </footer>
    </main>
  );
}
