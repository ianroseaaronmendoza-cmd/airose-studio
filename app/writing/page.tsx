import React from "react";

const WATTPAD_STORY_URL = "https://www.wattpad.com/story/143584713-in-the-mind-of-the-genius";
const WATTPAD_PROFILE = "https://www.wattpad.com/user/Mazedon";

// poem text (you gave it; I lightly polished it earlier — using your final approval text)
const POEM_TITLE = "To My Future Girl";
const POEM_LINES = [
  "I should let you know how much I want you now,",
  "For times have been cruel — I don’t want to remember how.",
  "I’m doing my best to pass this patience test,",
  "Still hoping for the fateful day — surely that’s the best.",
  "",
  "Are your eyes mesmerizing, enough to leave me paralyzed?",
  "Is your voice so alluring that it had me hypnotized?",
  "How about your hair, your lips, your ears, your fingertips?",
  "How could I even begin to imagine my hands upon your hips?",
  "",
  "I hope you’ll be patient, I hope you’ll be kind,",
  "Because a guy like me is surely out of his mind.",
  "I’m far from perfect — in fact, I’m the worst,",
  "But I assure you, my darling, choosing me will never be your remorse.",
  "",
  "I hope someday this poem would reach you;",
  "Let this be proof that I’ve been fervently waiting for you.",
  "To my future girl, whatever your name is —",
  "I’ll call you baby, honey, or darling — the only goddess I’d wish to kiss."
];

async function fetchOgImage(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return null;
    const html = await res.text();
    // quick regex to pull og:image or twitter:image
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) return ogMatch[1];
    const twMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (twMatch && twMatch[1]) return twMatch[1];
    return null;
  } catch (e) {
    return null;
  }
}

export default async function WritingPage() {
  // attempt to fetch Wattpad cover image (server-side)
  const cover = await fetchOgImage(WATTPAD_STORY_URL);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Writing</h1>
        <p className="text-gray-400 mt-2">Poems, short stories, and novels — welcome to my writing space.</p>
      </header>

      {/* Poem */}
      <section className="max-w-4xl mx-auto bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-semibold text-pink-400">{POEM_TITLE}</h2>
        <p className="text-gray-400 mt-3">A poem by Airose</p>

        <div className="mt-6 prose prose-invert text-center">
          {POEM_LINES.map((line, i) => (
            <p key={i} className="my-0">{line}</p>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href={WATTPAD_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-pink-500 px-4 py-2 rounded-md font-semibold text-black hover:bg-pink-600"
          >
            View on Wattpad
          </a>
        </div>
      </section>

      {/* Novel */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <div className="w-full h-auto rounded-lg overflow-hidden border border-gray-800">
            {cover ? (
              // Wattpad cover image (fetched from og:image)
              // Note: if Wattpad blocks fetch, cover can be null and we fall back to a placeholder
              // the image is loaded directly from Wattpad's CDN via the og:image URL
              // Use width:100% and object-cover for nice crop.
              // Add alt text for accessibility.
              <img src={cover} alt="In the Mind of the Genius — cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-900 text-gray-500">
                Cover unavailable
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-semibold">In the Mind of the Genius</h3>
          <p className="text-gray-400 mt-1">A novel by Mazedon</p>

          <div className="mt-4 text-gray-300">
            <p><strong>Synopsis</strong></p>
            <p className="mt-2 text-gray-400">
              Brianna Sheiyreen, a girl blessed with both beauty and brilliance, was accepted to Ecclesiastes University — the finest university in the country.
              One day she was dumb-folded by an ominous writing on the blackboard. This incident sparked her curiosity and caused her to meet different people who changed the course of her life.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["crime", "mystery", "romance", "genius", "school"].map((t) => (
              <span key={t} className="text-xs px-3 py-1 bg-gray-900 text-gray-300 rounded-full border border-gray-800">
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <a
              href={WATTPAD_STORY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-pink-500 px-4 py-2 rounded-md font-semibold text-black hover:bg-pink-600"
            >
              Read on Wattpad →
            </a>
          </div>
        </div>
      </section>

      {/* Footer (same as homepage) */}
      <footer className="mt-16 border-t border-gray-800 pt-6 text-center">
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
