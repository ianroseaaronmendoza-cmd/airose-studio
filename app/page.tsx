"use client";

export default function Home() {
  const spotifyEmbedSrc =
    "https://open.spotify.com/embed/track/7CDwsfGOr3qlBarBSCi6cQ?utm_source=generator";
  const albumLink =
    "https://open.spotify.com/album/6hUWTFwCv1ueihicozJydq?si=0B8y55MuT-akstixXxcxmQ";

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight max-w-6xl">
          Where imagination becomes craft.
        </h1>
        <p className="mt-6 text-gray-400 max-w-2xl">
          Welcome to{" "}
          <span className="text-pink-400 font-medium">Airose Studio</span> — a
          creative space where music, tools, and stories come to life.
        </p>

        {/* Hero Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          {/* ✅ Fixed: Readable text on pink background */}
          <a
            href="#projects"
            className="bg-pink-500 hover:bg-pink-600 text-black font-semibold px-6 py-3 rounded-md transition"
          >
            Explore Projects
          </a>

          <a
            href="#music"
            className="border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white font-semibold px-6 py-3 rounded-md transition"
          >
            Listen to Music
          </a>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-6">✨ Featured Projects</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Project 1 */}
          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800 hover:border-pink-500/50 transition">
            <h3 className="text-pink-400 font-semibold">
              Airose Lyric Video Maker
            </h3>
            <p className="text-gray-400 mt-2">
              Create lyric videos effortlessly.
            </p>
            <div className="mt-4">
              <button className="text-sm hover:text-pink-400">View →</button>
            </div>
          </div>

          {/* Project 2 */}
          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800 hover:border-pink-500/50 transition">
            <h3 className="text-pink-400 font-semibold">
              Airose Harmony Trainer
            </h3>
            <p className="text-gray-400 mt-2">
              Learn and practice vocal harmonies.
            </p>
            <div className="mt-4">
              <button className="text-sm hover:text-pink-400">View →</button>
            </div>
          </div>

          {/* Project 3 */}
          <div className="p-6 bg-[#0e0e0e] rounded-2xl border border-gray-800 hover:border-pink-500/50 transition">
            <h3 className="text-pink-400 font-semibold">Airose Refiner Mini</h3>
            <p className="text-gray-400 mt-2">
              Timestamp and sync lyrics with precision.
            </p>
            <div className="mt-4">
              <button className="text-sm hover:text-pink-400">View →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Music */}
      <section
        id="music"
        className="px-6 py-16 border-t border-gray-800 bg-[#0d0d0d]"
      >
        <h2 className="text-2xl font-bold mb-6">🎵 Featured Music</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Single */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
            <p className="text-pink-400 font-semibold">Ikaw Lang, Hesus</p>
            <p className="text-gray-400 text-sm mt-1">Featured single</p>

            <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
              <iframe
                title="Ikaw Lang, Hesus - Spotify"
                src={spotifyEmbedSrc}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            </div>
          </div>

          {/* Album */}
<div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
  <p className="text-pink-400 font-semibold">Airose's Compositions</p>
  <p className="text-gray-400 text-sm mt-1">Full Playlist</p>

  <div className="mt-4 rounded-lg overflow-hidden border border-gray-800">
    <iframe
      title="Airose Playlist"
      style={{ borderRadius: "12px" }}
      src="https://open.spotify.com/embed/playlist/2zNmUwTinrldAjDzQA7Obo?utm_source=generator"
      width="100%"
      height="352"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
  </div>

  <p className="text-gray-400 mt-6 text-sm">
    A worship playlist by Airose Official — featuring “I Count It as Gain” and more songs of faith.
  </p>
</div>

        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-6">🖋 Writing</h2>
        <p className="text-gray-400">
          Poems, short stories, and reflections — read more on the Writing page.
        </p>
        <div className="mt-4">
          <a href="/writing" className="text-pink-400 hover:underline">
            Open Writing →
          </a>
        </div>
      </section>
    </>
  );
}



