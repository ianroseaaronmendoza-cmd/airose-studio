"use client";

import Link from "next/link";

export default function Home() {
  // Spotify embed src you supplied (keeps utm param)
  const spotifyEmbedSrc =
    "https://open.spotify.com/embed/track/7CDwsfGOr3qlBarBSCi6cQ?utm_source=generator";

  // Album link (I Count It as Gain)
  const albumLink =
    "https://open.spotify.com/album/6hUWTFwCv1ueihicozJydq?si=0B8y55MuT-akstixXxcxmQ";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808] z-50">
        <div className="text-lg font-semibold">Airose Studio</div>

        <nav className="space-x-6 hidden md:flex">
          <Link href="/" className="text-sm hover:text-pink-400">Home</Link>
          <Link href="/music" className="text-sm hover:text-pink-400">Music</Link>
          <Link href="/projects" className="text-sm hover:text-pink-400">Projects</Link>
          <Link href="/writing" className="text-sm hover:text-pink-400">Writing</Link>
          <Link href="/about" className="text-sm hover:text-pink-400">About</Link>
          <Link href="/support" className="text-sm hover:text-pink-400">Support</Link>

        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight max-w-6xl">
          Where imagination becomes craft.
        </h1>
        <p className="mt-6 text-gray-400 max-w-2xl">
          Welcome to Airose Studio — a creative space where music, tools, and stories come to life.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="#projects"
            className="bg-pink-500 hover:bg-pink-600 text-black font-semibold px-5 py-3 rounded-lg"
          >
            Explore Projects
          </a>
          <a
            href="#music"
            className="border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white font-semibold px-5 py-3 rounded-lg"
          >
            Listen to Music
          </a>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="px-6 py-12 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-6">✨ Featured Projects</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800">
            <h3 className="text-pink-400 font-semibold">Airose Lyric Video Maker</h3>
            <p className="text-gray-400 mt-2">Create lyric videos effortlessly.</p>
            <div className="mt-4"><button className="text-sm hover:text-pink-400">View →</button></div>
          </div>

          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800">
            <h3 className="text-pink-400 font-semibold">Airose Harmony Trainer</h3>
            <p className="text-gray-400 mt-2">Learn and practice vocal harmonies.</p>
            <div className="mt-4"><button className="text-sm hover:text-pink-400">View →</button></div>
          </div>

          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800">
            <h3 className="text-pink-400 font-semibold">Airose Refiner Mini</h3>
            <p className="text-gray-400 mt-2">Timestamp and sync lyrics with precision.</p>
            <div className="mt-4"><button className="text-sm hover:text-pink-400">View →</button></div>
          </div>
        </div>
      </section>

      {/* Music */}
      <section id="music" className="px-6 py-12 border-t border-gray-800 bg-[#0d0d0d]">
        <h2 className="text-2xl font-bold mb-6">🎵 Featured Music</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Featured track embed */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
            <p className="text-pink-400 font-semibold">Ikaw lang, Hesus</p>
            <p className="text-gray-400 text-sm mt-1">Featured single</p>

            <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
              {/* Use the iframe src you provided */}
              <iframe
                title="Ikaw lang Hesus - Spotify"
                src={spotifyEmbedSrc}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            </div>
          </div>

          {/* Album card */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 bg-gray-900 rounded-lg flex-shrink-0 border border-gray-800 overflow-hidden">
                {/* simple placeholder square for album art — link opens album */}
                <a href={albumLink} target="_blank" rel="noreferrer">
                  <img
                    alt="I Count It as Gain album cover"
                    src={`https://i.scdn.co/image/placeholder`} /* harmless placeholder; replace if you want direct album art */
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white">I Count It as Gain</h4>
                <p className="text-gray-400 text-sm mt-1">Album</p>
                <div className="mt-3">
                  <a
                    href={albumLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-pink-500 hover:bg-pink-600 text-black px-4 py-2 rounded-md font-semibold"
                  >
                    Listen on Spotify
                  </a>
                </div>
              </div>
            </div>

            <p className="text-gray-400 mt-6 text-sm">
              An album collection by Airose Official — listen to the full release on Spotify.
            </p>
          </div>
        </div>
      </section>

      {/* Writing teaser */}
      <section id="writing" className="px-6 py-12 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-6">🖋 Writing</h2>
        <p className="text-gray-400">Poems, short stories, and novels — read more on the Writing page.</p>
        <div className="mt-4">
          <a href="/writing" className="text-pink-400 hover:underline">Open Writing →</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-8 text-center">
        <p className="text-sm text-gray-400">© 2025 Airose Studio | Built with ❤️ and purpose.</p>

        <div className="mt-4 flex justify-center gap-6 text-gray-400">
          <a href="https://www.instagram.com/airose_official/" target="_blank" rel="noreferrer" className="hover:text-pink-400">Instagram</a>
          <a href="https://open.spotify.com/artist/7siLh2Wz78DXsMBsS3HRGG?si=a8fc159d713c4648" target="_blank" rel="noreferrer" className="hover:text-pink-400">Spotify</a>
          <a href="https://www.youtube.com/@AiroseOfficial" target="_blank" rel="noreferrer" className="hover:text-pink-400">YouTube</a>
          <a href="https://www.wattpad.com/user/Mazedon" target="_blank" rel="noreferrer" className="hover:text-pink-400">Wattpad</a>
        </div>
      </footer>
    </main>
  );
}
