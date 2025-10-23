"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * components/music.jsx
 *
 * - Includes 4 songs (full stories + lyrics)
 * - Sidebar: story static, lyrics scrollable
 * - Use with Tailwind and the provided global scrollbar CSS (.custom-scroll)
 */

/* =========================
   Data - full stories & lyrics
   ========================= */
const albums = [
  {
    id: "count-it-gain",
    title: "I Count It as Gain",
    year: 2025,
    cover: "",
    songs: [
      {
        id: "count-it-gain-track",
        title: "I Count It as Gain",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/51qUsWUPNmdCwpEbWgpnBh?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story:
`I think it was 2015 when I made this song. I sang it to my church and they loved it. But for me, it is more than just a worship song to be sung in the church. This song is a cry of desperation. Back then, my life seems out of place. Everything is in chaos. Depression has been a common thought. I can't even visualize my own future. Death seemed like a sweet escape. But I realized - If I'm going to die anyway, why not die for God? Yes, it is painful. Yes, it is hard. Death looked like a blessing... so what am I supposed to be afraid of? I might as well choose to worship God. If I'm losing everything, if everything is chaotic, if everything seems unsolvable - why not chose to worship? I can't think of a solution either way.

He who loses his life for God's sake will find it. I'll worship, so I made this song. Funny enough, God didn't snap His fingers and miraculously fixed everything to work in my favor. But He fixed something more important - my heart. 10 years later, I still want to worship His name.`,
        lyrics:
`[Verse 1]
Seems like every day
These snares are in my way
When I'm about to lose all the hope
I'll say, I'll pray in Your name

[Pre-Chorus]
Then Your Word will comfort me
I know Your Word will rescue me

[Chorus]
So I count it as gain when I suffer in pain
Lord I want to worship Your name
Lord I count it as gain, yes I'll die every day
Lord I want to worship Your name
So I count it, I count it as gain

[Verse 2]
When my future is bleak
And the enemy is on his streak
When I'm about to fall on my knees
Yes it's You, Your strength is in me

[Pre-Chorus]
Then Your Word will comfort me
I know Your Word will rescue me

[Chorus]
So I count it as gain when I suffer in pain
Lord I want to worship Your name
Lord I count it as gain, yes I'll die every day
Lord I want to worship Your name

So I count it as gain when I suffer in pain
Lord I want to worship Your name
Lord I count it as gain, yes I'll die every day
Lord I want to worship Your name
So I count it, I count it as gain`
      },
      {
        id: "you-are-track",
        title: "You Are",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/4lG4c5KODDhL23ORVdeXrn?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story:
`This is literally my first composition! I can still remember that burning desire to make my own song for God. I'm not content with singing songs created by other artists. It's not that I'm opposed to it, but more like I want to give something special to God, like a personal "from me to You" moment. My own words, my own emotions, my raw voice. Admittedly, the phrasing and the technicality was not that good but I'm just happy to give it to the Lord. Years passed, I've changed the verses, added a bridge part, I even changed the title from "I just want to sing" to "You are" -- and now you're hearing the updated version of the song. But same heart and still one burning desire - I just want to sing for You, Jesus.`,
        lyrics:
`[Verse 1]
From the rising sun 
To the setting light,
Your mercy shines 
Through darkest night.

[Verse 2]
The heavens proclaim the work of Your hand,
All creation bows at Your command.
You lift the broken, You heal the weak,
Your voice brings peace when the storms still speak.

[Pre Chorus]
Your promises stand, unshaken, secure,
Forever Your kingdom shall endure.

[Chorus]
You are
The Everlasting God
You are
The First and the Last oh God
You are
My everything, Lord
I just wanna sing

[Verse 3]
Alpha, Omega, 
Beginning and End,
Faithful Redeemer,
Savior, and Friend.

[Pre Chorus]
Please hear my song, oh God
For my heart longs only for You

[Chorus]
You are
The Everlasting God
You are
The First and the Last oh God
You are
My everything, Lord
I just wanna sing

[Bridge]
You saved us from sin
You washed us now we're clean
So I will follow you my Lord,
Jesus

You saved us from sin
You washed us now we're clean (yeah yeah)
So I will follow you my Lord
I just wanna sing

[Chorus]
You are
The Everlasting God
You are
The First and the Last oh God
You are
My everything, Lord
I just wanna sing

[Chorus]
You are
The Everlasting God
You are
The First and the Last oh God
You are
My everything, Lord
I just wanna sing`
      },
      {
        id: "this-song-for-you-track",
        title: "This Song Is for You",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/2WrgDg3DZCdz2UrDrKM0gv?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story:
`Have you ever felt that all the words that the humanity created seems inadequate to describe the beauty of our God? Yes? SAME! As I was starting this music-creating journey, I stumbled onto this big problem - NO SONG NOR WORDS WILL EVER BE ABLE TO CAPTURE THE FULLEST OF OUR GOD! And this has become the theme of the song, my frustration turned into worship! I know that words will never be enough, even if I spent my eternity to describe God's glory, I will find myself failing to do so. But I'm not giving up! Even if this is just a shout, a shout that is unintelligible and meaningless. But God looks into our hearts, our desire to give this song to God, I think that is enough. The thoughts that can not be communicated with words will be communicated through the heart. So shout it out!`,
        lyrics:
`[Verse 1]
Words are not enough to say how much I love you, Lord
But I can't stand still
I'm so desperate to sing for You, oh my Lord.
I'll give you all of me.

[Pre-chorus]
I'm not gonna hold back,
Can't contain this feeling anymore!

[Chorus]
This song is for You!
Sing la, la, lalala, la, lala
This song is for You!
Sing la, la, lalala, la, lala

[Verse 2]
No melody can carry the fullness of Your name.
Still I will sing again.
Your church is singing, the angels are joining.
You deserve all the praise!

[Pre-chorus]
I'm not gonna hold back,
Can't contain this feeling anymore!

[Chorus]
This song is for You!
Sing la, la, lalala, la, lala
This song is for You!
Sing la, la, lalala, la, lala`
      }
    ]
  },
  {
    id: "ikaw-lang-hesus-single",
    title: "Ikaw Lang, Hesus (Single)",
    year: 2025,
    cover: "",
    songs: [
      {
        id: "ikaw-lang-track",
        title: "Ikaw Lang, Hesus",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/7CDwsfGOr3qlBarBSCi6cQ?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story:
`I have only one goal in making this song - Just You, Jesus. A tagalog worship song that is admittedly very simple. No flairs, no acrobatics. Just Jesus. But simplicity has its own charm. Making a point cross is simpler if we make it clear. This song is an attempt to do that. I don't want anything, just You, Jesus. In my heart, just You, Jesus. Day and night, it's just You, Jesus. Why should I make it so complicated? If Jesus likes it, then everything is good. It's not for our ears to enjoy, it is for Jesus, for God alone.`,
        lyrics:
`(Verse 1)
Sa puso ko, Ikaw lang, Hesus
Sa isip ko, Ikaw lang, Hesus
Ang pag-ibig Mo, sapat sa 'kin
Ang presensya Mo, aking hiling

(Chorus)
Ikaw lang, Ikaw lang, Hesus
Panginoon, Ikaw lang, Hesus
Sa buhay ko, Ikaw lang, Hesus
Aking Diyos, Ikaw lang, Hesus

(Verse 2)
Sa bawat araw, Ikaw ang gabay
Sa bawat hakbang, Ikaw ang tanglaw
Ang kapayapaan, sa 'Yo natagpuan
Ang kalakasan, sa 'Yo nagmumula

(Bridge)
Walang iba, walang hihigit
Sa pag-ibig Mong walang patid
Puso'y sumisigaw, Ikaw ang buhay
Sa 'Yo lang, Hesus, ako'y magtatagal`
      }
    ]
  }
];

/* =========================
   Component
   ========================= */
export default function Music() {
  const [openAlbumId, setOpenAlbumId] = useState(null); // which album expands
  const [activeSong, setActiveSong] = useState(null); // currently opened song object
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeStoryPanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleAlbum = (id) => setOpenAlbumId((prev) => (prev === id ? null : id));

  const openStoryPanel = (song, openWithLyrics = false) => {
    setActiveSong(song);
    setShowLyrics(openWithLyrics);
    // lock background scroll while panel open
    document.documentElement.style.overflow = "hidden";
  };

  const closeStoryPanel = () => {
    setActiveSong(null);
    setShowLyrics(false);
    document.documentElement.style.overflow = "";
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto text-gray-100">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-semibold">Music</h1>
        <p className="text-sm opacity-80 mt-1">Songs & stories — Airose listening diary.</p>
      </header>

      {/* Albums stacked vertically */}
      <div className="flex flex-col gap-6">
        {albums.map((album) => (
          <div key={album.id} className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleAlbum(album.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") toggleAlbum(album.id); }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-sm">
                  {album.cover ? (
                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs opacity-80">{album.songs.length} tracks</span>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-lg">{album.title}</div>
                  <div className="text-xs opacity-70">{album.year}</div>
                </div>
              </div>

              <div className="text-sm opacity-80">{openAlbumId === album.id ? "Hide" : "Open"}</div>
            </div>

            <AnimatePresence initial={false}>
              {openAlbumId === album.id && (
                <motion.div
                  key="songs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="space-y-4">
                    {album.songs.map((song) => (
                      <div key={song.id} className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="md:flex md:items-start md:gap-4">
                          <div
                            className="rounded-md overflow-hidden flex-1"
                            dangerouslySetInnerHTML={{ __html: song.embed }}
                          />

                          <div className="mt-3 md:mt-0 md:w-44 md:flex md:flex-col md:justify-between">
                            <div>
                              <div className="font-medium">{song.title}</div>
                            </div>

                            <div className="flex gap-2 mt-3 md:mt-0">
                              <button
                                onClick={() => openStoryPanel(song, false)}
                                className="px-3 py-1 rounded-md bg-pink-500/80 hover:bg-pink-500 text-black text-sm font-medium transition"
                                aria-label={`Open story for ${song.title}`}
                              >
                                Story
                              </button>

                              <button
                                onClick={() => openStoryPanel(song, true)}
                                className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-800 transition"
                                aria-label={`Open lyrics for ${song.title}`}
                              >
                                Lyrics
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* STORY SIDE PANEL */}
      <AnimatePresence>
        {activeSong && (
          <>
            {/* dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={closeStoryPanel}
              className="fixed inset-0 bg-black z-40"
            />

            <motion.aside
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  className="fixed top-0 right-0 z-50 h-full w-full md:w-[42%] lg:w-[36%] bg-neutral-950/95 backdrop-blur flex flex-col"
  role="dialog"
  aria-modal="true"
>
  {/* Header */}
  <div className="flex-shrink-0 p-6 flex items-start justify-between gap-4 border-b border-neutral-800/40">
    <div>
      <h2 className="text-2xl font-semibold">{activeSong.title}</h2>
      <p className="text-xs opacity-70 mt-1">Story & lyrics</p>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowLyrics((s) => !s)}
        className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition"
      >
        {showLyrics ? "Hide lyrics" : "Show lyrics"}
      </button>

      <button
        onClick={closeStoryPanel}
        aria-label="Close story panel"
        className="p-2 rounded-md hover:bg-neutral-900"
      >
        ✕
      </button>
    </div>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
    {/* Spotify embed */}
    <div className="rounded-lg overflow-hidden">
      <div dangerouslySetInnerHTML={{ __html: activeSong.embed }} />
    </div>

    {/* Story section */}
    {!showLyrics && (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
        {activeSong.story}
      </div>
    )}

    {/* Lyrics section */}
    {showLyrics && (
      <div className="bg-neutral-900/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {activeSong.lyrics || "Lyrics not available."}
      </div>
    )}
  </div>
</motion.aside>

          </>
        )}
      </AnimatePresence>
    </div>
  );
}
