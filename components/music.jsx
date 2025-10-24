"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "@/app/context/EditorContext";

/**
 * components/music.jsx (full-featured, updated controls layout)
 *
 * - Full feature set retained (Add/Edit/Delete/Reorder/Upload/ImportExport/Undo/Multi-tab sync)
 * - Action buttons moved below playback/title and use flex-wrap to avoid clipping on narrow screens
 * - Persists metadata to localStorage; audio uploads to IndexedDB
 *
 * Local persistence keys:
 * - music_local_v1: Array of album objects (local overrides / new)
 * - music_deleted_v1: Object { albums: string[], songs: { [albumId]: string[] } } (tombstones)
 *
 * Uploaded audio stored in IndexedDB as key "music_blob:<id>" (value: Blob)
 * Track.src uses:
 *   - embed HTML (string) when set (spotify iframe, etc.)
 *   - url string (http(s) or data URL)
 *   - idb://<id> when stored in IndexedDB (this component resolves that to an objectURL)
 */

/* =========================
   Default data (your existing albums)
   ========================= */
const DEFAULT_ALBUMS = [
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
I just wanna sing`
      },
      {
        id: "this-song-for-you-track",
        title: "This Song Is for You",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/2WrgDg3DZCdz2UrDrKM0gv?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story:
`Have you ever felt that all the words that the humanity created seem inadequate to describe the beauty of our God? Yes? SAME! As I was starting in this music-creating journey, I stumbled onto this big problem - NO SONG OR WORDS WILL EVER BE ABLE TO CAPTURE THE FULLEST OF OUR GOD! Yes? SAME! As I was starting in this music-creating journey, I stumbled onto this big problem - NO SONG OR WORDS WILL EVER BE ABLE TO CAPTURE THE FULLEST OF OUR GOD! And this has become the theme of the song, my frustration turned into worship! I know that words will never be enough, even if I spent my eternity to describe God's glory, I will find myself failing to do so. But I'm not giving up! Even if this is just a shout, a shout that is unintelligible and meaningless. But God looks into our hearts, our desire to give this song to God, I think that is enough. The thoughts that can not be communicated with words will be communicated through the heart. So shout it out!`,
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
   IndexedDB helpers (small wrapper)
   ========================= */
const IDB_DB = "music_db_v1";
const IDB_STORE = "blobs";

function openIDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key, blob) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const r = store.put(blob, key);
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

async function idbGet(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const r = store.get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => reject(r.error);
  });
}

async function idbDelete(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const r = store.delete(key);
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

/* =========================
   LocalStorage helpers & merge logic
   ========================= */
const LS_LOCAL = "music_local_v1";
const LS_DELETED = "music_deleted_v1";

function loadLocal() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_LOCAL);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("music: loadLocal failed", e);
    return null;
  }
}

function persistLocal(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_LOCAL, JSON.stringify(data));
    // notify other tabs that we updated (some browsers already fire storage)
    window.dispatchEvent(new StorageEvent("storage", { key: LS_LOCAL, newValue: JSON.stringify(data) }));
  } catch (e) {
    console.warn("music: persistLocal failed", e);
  }
}

function loadDeleted() {
  if (typeof window === "undefined") return { albums: [], songs: {} };
  try {
    const raw = localStorage.getItem(LS_DELETED);
    return raw ? JSON.parse(raw) : { albums: [], songs: {} };
  } catch (e) {
    return { albums: [], songs: {} };
  }
}

function persistDeleted(obj) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_DELETED, JSON.stringify(obj));
    window.dispatchEvent(new StorageEvent("storage", { key: LS_DELETED, newValue: JSON.stringify(obj) }));
  } catch (e) {
    console.warn("music: persistDeleted failed", e);
  }
}

/* Merge defaults + local overrides while respecting deleted tombstones
   Local structure mirrors album shape:
   [{ id, title, year, cover, songs: [{ id, title, embed, src, story, lyrics }] }]
*/
function buildMerged(defaults, local, deleted) {
  const delAlbums = new Set((deleted && deleted.albums) || []);
  const deletedSongsMap = (deleted && deleted.songs) || {};

  const map = new Map();
  (defaults || []).forEach((alb) => {
    if (!delAlbums.has(alb.id)) {
      // filter default songs by deleted songs for that album
      const defaultSongs = (alb.songs || []).filter((s) => {
        const delForAlbum = new Set(deletedSongsMap[alb.id] || []);
        return !delForAlbum.has(s.id);
      });
      map.set(alb.id, { ...alb, songs: defaultSongs.map((s) => ({ ...s })) });
    }
  });

  (local || []).forEach((alb) => {
    if (!delAlbums.has(alb.id)) {
      const existing = map.get(alb.id) || { id: alb.id, title: alb.title, year: alb.year, cover: alb.cover, songs: [] };
      const songMap = new Map();
      (existing.songs || []).forEach((s) => songMap.set(s.id, { ...s }));
      (alb.songs || []).forEach((s) => songMap.set(s.id, { ...s })); // local overrides default by id
      map.set(alb.id, { ...existing, ...alb, songs: Array.from(songMap.values()) });
    }
  });

  return Array.from(map.values());
}

/* =========================
   Utility helpers
   ========================= */
const uid = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

function downloadJSON(filename, obj) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================
   Component
   ========================= */
export default function Music() {
  const { editorMode } = useEditor();

  const [local, setLocal] = useState(null); // local overrides
  const [deleted, setDeleted] = useState({ albums: [], songs: {} });
  const [albums, setAlbums] = useState(DEFAULT_ALBUMS);
  const [openAlbumId, setOpenAlbumId] = useState(null);
  const [activeSong, setActiveSong] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [editing, setEditing] = useState(null); // { albumId, songId, new:bool }
  const [toast, setToast] = useState(null); // { message, actionLabel, action }
  const undoRef = useRef(null);

  // map idb:// -> objectURLs
  const idbUrlsRef = useRef({});

  useEffect(() => {
    // initial load
    const l = loadLocal();
    const d = loadDeleted();
    setLocal(l || []);
    setDeleted(d || { albums: [], songs: {} });
    setAlbums(buildMerged(DEFAULT_ALBUMS, l || [], d || { albums: [], songs: {} }));

    // storage sync
    const onStorage = (e) => {
      if (e.key === LS_LOCAL) {
        const l2 = loadLocal();
        setLocal(l2 || []);
        setAlbums(buildMerged(DEFAULT_ALBUMS, l2 || [], loadDeleted() || { albums: [], songs: {} }));
      }
      if (e.key === LS_DELETED) {
        const d2 = loadDeleted();
        setDeleted(d2 || { albums: [], songs: {} });
        setAlbums(buildMerged(DEFAULT_ALBUMS, loadLocal() || [], d2 || { albums: [], songs: {} }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Ensure merged albums updated when local/deleted changed
  useEffect(() => {
    setAlbums(buildMerged(DEFAULT_ALBUMS, local || [], deleted || { albums: [], songs: {} }));
  }, [local, deleted]);

  // cleanup objectURLs on unmount
  useEffect(() => {
    return () => {
      Object.values(idbUrlsRef.current).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      idbUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeStoryPanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAlbum = (id) => setOpenAlbumId((prev) => (prev === id ? null : id));

  const openStoryPanel = (song, openWithLyrics = false) => {
    setActiveSong(song);
    setShowLyrics(openWithLyrics);
    document.documentElement.style.overflow = "hidden";
  };

  const closeStoryPanel = () => {
    setActiveSong(null);
    setShowLyrics(false);
    setEditing(null);
    document.documentElement.style.overflow = "";
  };

  // ---------- IDB helpers for audio uploads ----------
  async function storeUploadGetId(file) {
    const key = `music_blob:${uid("")}`;
    await idbPut(key, file);
    return key;
  }

  async function resolveSrcToUrl(src) {
    if (!src) return null;
    if (src.startsWith("idb://")) {
      const id = src.replace("idb://", "");
      const key = `music_blob:${id}`;
      if (idbUrlsRef.current[key]) return idbUrlsRef.current[key];
      const blob = await idbGet(key);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      idbUrlsRef.current[key] = url;
      return url;
    }
    // otherwise assume it's a direct URL or data URL
    return src;
  }

  async function deleteUploadBySrc(src) {
    if (!src || !src.startsWith("idb://")) return;
    const id = src.replace("idb://", "");
    const key = `music_blob:${id}`;
    try {
      await idbDelete(key);
      if (idbUrlsRef.current[key]) {
        URL.revokeObjectURL(idbUrlsRef.current[key]);
        delete idbUrlsRef.current[key];
      }
    } catch (e) {
      // ignore
    }
  }

  // ---------- CRUD: Add / Edit / Delete / Reorder ----------
  function createAlbum(title = "Untitled Album") {
    const newAlbum = { id: `alb-${uid("")}`, title, year: new Date().getFullYear(), cover: "", songs: [] };
    const updated = [...(local || []), newAlbum];
    setLocal(updated);
    persistLocal(updated);
    setToast({ message: "Album created", actionLabel: "Open", action: () => setOpenAlbumId(newAlbum.id) });
  }

  function createSong(albumId) {
    const newSong = { id: `song-${uid("")}`, title: "Untitled", embed: "", src: "", story: "", lyrics: "" };
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: [...(updatedLocal[idx].songs || []), newSong] };
    } else {
      // create local override for album (copy title from merged)
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, title: albumId, songs: [] };
      updatedLocal.push({ id: albumId, title: merged.title, year: merged.year, cover: merged.cover, songs: [...(merged.songs || []), newSong] });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    // open editor in side panel
    setEditing({ albumId, songId: newSong.id, isNew: true });
    openStoryPanel(newSong, false);
  }

  function saveSongEdits(albumId, song) {
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: (updatedLocal[idx].songs || []).map((s) => (s.id === song.id ? song : s)) };
    } else {
      // create local override that applies the updated song on top of merged album
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, songs: [] };
      updatedLocal.push({ id: albumId, title: merged.title, year: merged.year, cover: merged.cover, songs: (merged.songs || []).map((s) => (s.id === song.id ? song : s)).concat((merged.songs || []).some(s=>s.id===song.id) ? [] : [song]) });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setToast({ message: "Saved", actionLabel: null, action: null });
    setEditing(null);
    // refresh activeSong if it was open
    if (activeSong && activeSong.id === song.id) {
      setActiveSong(song);
    }
  }

  function deleteSong(albumId, songId) {
    // show undo snackbar
    const mergedAlbum = albums.find((a) => a.id === albumId) || null;
    const song = mergedAlbum?.songs?.find((s) => s.id === songId) || null;
    if (!song) return;

    // remove from local override if present
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: (updatedLocal[idx].songs || []).filter((s) => s.id !== songId) };
      setLocal(updatedLocal);
      persistLocal(updatedLocal);
    }

    // if it exists in defaults, add tombstone
    const isDefault = DEFAULT_ALBUMS.some((a) => a.id === albumId && (a.songs || []).some((s) => s.id === songId));
    const deletedState = loadDeleted();
    const songsMap = { ...(deletedState.songs || {}) };
    if (isDefault) {
      const arr = new Set(songsMap[albumId] || []);
      arr.add(songId);
      songsMap[albumId] = Array.from(arr);
      const newDeleted = { ...deletedState, songs: songsMap };
      setDeleted(newDeleted);
      persistDeleted(newDeleted);
    } else {
      // not default and not in local -> it's likely already not present
    }

    // schedule undo
    if (song.src && song.src.startsWith("idb://")) {
      // don't delete blob yet — wait for undo window
    }

    undoRef.current = {
      type: "deleteSong",
      payload: { albumId, song },
      revert: async () => {
        // restore local override (re-add song)
        const curLocal = loadLocal() || [];
        const i = curLocal.findIndex((a) => a.id === albumId);
        if (i >= 0) {
          curLocal[i] = { ...curLocal[i], songs: [...(curLocal[i].songs || []), song] };
        } else {
          curLocal.push({ id: albumId, title: albums.find(a=>a.id===albumId)?.title || albumId, songs: [song] });
        }
        persistLocal(curLocal);
        setLocal(curLocal);
        // remove tombstone if it was a default removal
        const ds = loadDeleted();
        if ((ds.songs || {})[albumId]) {
          ds.songs[albumId] = (ds.songs[albumId] || []).filter((s) => s !== song.id);
          persistDeleted(ds);
          setDeleted(ds);
        }
      }
    };

    setToast({ message: "Song deleted", actionLabel: "Undo", action: () => handleUndo() });
    // auto-clear toast after 6s and finalize deletion (remove blobs) if not undone
    setTimeout(async () => {
      if (undoRef.current && undoRef.current.type === "deleteSong" && undoRef.current.payload.albumId === albumId && undoRef.current.payload.song.id === songId) {
        // finalize: delete uploaded blob if any
        if (song.src && song.src.startsWith("idb://")) {
          const id = song.src.replace("idb://", "");
          await idbDelete(`music_blob:${id}`);
        }
        undoRef.current = null;
        setToast(null);
      }
    }, 6000);
  }

  function handleUndo() {
    if (!undoRef.current) return;
    const r = undoRef.current;
    r.revert && r.revert();
    undoRef.current = null;
    setToast({ message: "Undo successful", actionLabel: null, action: null });
    setTimeout(() => setToast(null), 1500);
  }

  function deleteAlbum(albumId) {
    // remove local override if present
    const updatedLocal = (local || []).filter((a) => a.id !== albumId);
    setLocal(updatedLocal);
    persistLocal(updatedLocal);

    // tombstone default albums
    const isDefault = DEFAULT_ALBUMS.some((a) => a.id === albumId);
    const ds = loadDeleted();
    const newDeleted = { ...ds, albums: ds.albums.includes(albumId) ? ds.albums : [...ds.albums, albumId] };
    setDeleted(newDeleted);
    persistDeleted(newDeleted);

    setToast({ message: "Album deleted", actionLabel: "Undo", action: handleUndo });

    // setup undo to un-tombstone
    undoRef.current = {
      type: "deleteAlbum",
      payload: { albumId },
      revert: () => {
        const ds2 = loadDeleted();
        ds2.albums = (ds2.albums || []).filter((x) => x !== albumId);
        persistDeleted(ds2);
        setDeleted(ds2);
      }
    };

    setTimeout(() => {
      if (undoRef.current && undoRef.current.type === "deleteAlbum" && undoRef.current.payload.albumId === albumId) {
        undoRef.current = null;
        setToast(null);
      }
    }, 6000);
  }

  // reorder songs: move up/down within album
  function moveSong(albumId, songId, direction) {
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      const arr = [...(updatedLocal[idx].songs || [])];
      const i = arr.findIndex((s) => s.id === songId);
      if (i < 0) return;
      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      updatedLocal[idx] = { ...updatedLocal[idx], songs: arr };
      setLocal(updatedLocal);
      persistLocal(updatedLocal);
      return;
    }

    // if no local override, create one from merged album and reorder there
    const mergedAlb = albums.find((a) => a.id === albumId);
    if (!mergedAlb) return;
    const arr = [...(mergedAlb.songs || [])];
    const i = arr.findIndex((s) => s.id === songId);
    if (i < 0) return;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    const newLocal = [...(local || []), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, cover: mergedAlb.cover, songs: arr }];
    setLocal(newLocal);
    persistLocal(newLocal);
  }

  // drag & drop handlers for songs (basic)
  function onDragStart(e, albumId, songId) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ albumId, songId }));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) {
    e.preventDefault();
  }
  function onDrop(e, albumId, targetSongId) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!data) return;
      const { albumId: srcAlbumId, songId: srcSongId } = data;
      if (srcAlbumId !== albumId) return; // limit to same album for now
      // find indices and reorder
      const mergedAlb = albums.find((a) => a.id === albumId);
      if (!mergedAlb) return;
      const arr = [...(mergedAlb.songs || [])];
      const i = arr.findIndex((s) => s.id === srcSongId);
      const j = arr.findIndex((s) => s.id === targetSongId);
      if (i < 0 || j < 0) return;
      const item = arr.splice(i, 1)[0];
      arr.splice(j, 0, item);
      // write to local override
      const newLocal = [...(local || []).filter(a=>a.id!==albumId), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, cover: mergedAlb.cover, songs: arr }];
      setLocal(newLocal);
      persistLocal(newLocal);
    } catch (err) {
      // ignore
    }
  }

  // ---------- Import / Export ----------
  function exportAll() {
    const payload = {
      local: local || [],
      deleted: deleted || { albums: [], songs: {} },
      timestamp: new Date().toISOString(),
    };
    downloadJSON(`music-export-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`, payload);
  }

  async function importFile(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.local) {
        setLocal(parsed.local);
        persistLocal(parsed.local);
      }
      if (parsed.deleted) {
        setDeleted(parsed.deleted);
        persistDeleted(parsed.deleted);
      }
      setToast({ message: "Import complete", actionLabel: null, action: null });
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setToast({ message: "Import failed", actionLabel: null, action: null });
      setTimeout(() => setToast(null), 2000);
    }
  }

  // ---------- Edit panel handling ----------
  function startEditing(albumId, songId) {
    const alb = albums.find((a) => a.id === albumId);
    const song = alb?.songs?.find((s) => s.id === songId) || null;
    if (!song) return;
    setEditing({ albumId, songId, isNew: false });
    openStoryPanel(song, false);
  }

  async function handleFileUpload(albumId, songId, file) {
    if (!file) return;
    const idKey = await storeUploadGetId(file); // returns key like music_blob:<id>
    const id = idKey.replace("music_blob:", ""); // preserve id without prefix
    // update song.src to idb://<id>
    const mergedAlb = albums.find((a) => a.id === albumId);
    const song = mergedAlb?.songs?.find((s) => s.id === songId);
    if (!song) return;
    const updatedSong = { ...song, src: `idb://${id}`, embed: "" };
    saveSongEdits(albumId, updatedSong);
    // make it available as object URL now (resolved lazily elsewhere)
  }

  // ---------- render helpers ----------
  function renderPlayback(song) {
    // prefer embed HTML if present
    if (song.embed) {
      return <div dangerouslySetInnerHTML={{ __html: song.embed }} />;
    }
    // if src is present:
    if (song.src && typeof window !== "undefined") {
      // if it is idb:// construct object URL
      if (song.src.startsWith("idb://")) {
        // resolveSrcToUrl returns a Promise; but inside render we can show a temporary <audio> with resolved URL using state hook
        return <IDBAudio src={song.src} />;
      } else {
        return <audio controls src={song.src} className="w-full" />;
      }
    }
    // fallback: small placeholder
    return <div className="text-sm text-gray-400">No playable source available</div>;
  }

  // small component to render an audio element from idb:// source
  function IDBAudio({ src }) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
      let mounted = true;
      (async () => {
        const res = await resolveSrcToUrl(src);
        if (mounted) setUrl(res);
      })();
      return () => {
        mounted = false;
      };
    }, [src]);
    if (!url) return <div className="text-sm text-gray-400">Loading audio…</div>;
    return <audio controls src={url} className="w-full" />;
  }

  // ---------- UI ----------
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto text-gray-100">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Music</h1>
          <p className="text-sm opacity-80 mt-1">Songs & stories — Airose listening diary.</p>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => exportAll()}
              className="px-3 py-2 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900"
            >
              Export
            </button>

            <label className="px-3 py-2 rounded-md border border-neutral-700 text-sm cursor-pointer hover:bg-neutral-900">
              Import
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importFile(f);
                  e.currentTarget.value = "";
                }}
                className="hidden"
              />
            </label>

            {editorMode && (
              <button
                onClick={() => createAlbum()}
                className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
              >
                + Album
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400">Editor Mode: {editorMode ? "ON" : "OFF"}</div>
        </div>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") toggleAlbum(album.id);
              }}
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

              <div className="text-sm opacity-80 flex items-center gap-3">
                <div>{openAlbumId === album.id ? "Hide" : "Open"}</div>
                {editorMode && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        createSong(album.id);
                      }}
                      className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                    >
                      + Song
                    </button>

                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        deleteAlbum(album.id);
                      }}
                      className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
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
                      <div
                        key={song.id}
                        className="bg-neutral-800/50 rounded-xl p-3"
                        draggable={editorMode}
                        onDragStart={(e) => onDragStart(e, album.id, song.id)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, album.id, song.id)}
                      >
                        <div className="md:flex md:items-start md:gap-4 pr-2">
                          <div className="rounded-md overflow-hidden flex-1">
                            {renderPlayback(song)}
                          </div>

                          {/* ---------- UPDATED CONTROLS LAYOUT ---------- */}
                          <div className="mt-3 md:mt-0 md:w-44">
                            <div className="font-medium">{song.title}</div>

                            {/* Primary actions row (Story / Lyrics) - allow wrapping */}
                            <div className="flex gap-2 mt-2 flex-wrap">
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

                            {/* Editor-only actions (Edit / Delete / Up / Down) on their own row */}
                            {editorMode && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    startEditing(album.id, song.id);
                                  }}
                                  className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    deleteSong(album.id, song.id);
                                  }}
                                  className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                                >
                                  Delete
                                </button>

                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    moveSong(album.id, song.id, "up");
                                  }}
                                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                                  aria-label="Move up"
                                >
                                  ▲
                                </button>

                                <button
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    moveSong(album.id, song.id, "down");
                                  }}
                                  className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                                  aria-label="Move down"
                                >
                                  ▼
                                </button>
                              </div>
                            )}
                          </div>
                          {/* ---------- END UPDATED CONTROLS LAYOUT ---------- */}
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

      {/* STORY / EDIT SIDE PANEL */}
      <AnimatePresence>
        {activeSong && (
          <>
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
                  {editing ? (
                    <button
                      onClick={() => {
                        setEditing(null);
                      }}
                      className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition"
                    >
                      Close edit
                    </button>
                  ) : (
                    editorMode && (
                      <button
                        onClick={() => {
                          // open edit for this song
                          // find album for this activeSong
                          const album = albums.find((a) => (a.songs || []).some((s) => s.id === activeSong.id));
                          if (album) startEditing(album.id, activeSong.id);
                        }}
                        className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition"
                      >
                        Edit
                      </button>
                    )
                  )}

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
                {/* Playback */}
                <div className="rounded-lg overflow-hidden">
                  {renderPlayback(activeSong)}
                </div>

                {/* If in edit mode for this song, show editable inputs */}
                {editing && editing.songId === activeSong.id ? (
                  <EditSongForm
                    albumId={editing.albumId}
                    song={activeSong}
                    onSave={async (updated) => {
                      // if user uploaded new file (File object), handle upload
                      if (updated._uploadFile instanceof File) {
                        const key = await storeUploadGetId(updated._uploadFile);
                        const id = key.replace("music_blob:", "");
                        updated = { ...updated, src: `idb://${id}`, embed: "" };
                        delete updated._uploadFile;
                      }
                      saveSongEdits(editing.albumId, updated);
                      setActiveSong(updated);
                      setEditing(null);
                    }}
                    onCancel={() => {
                      setEditing(null);
                    }}
                    onUploadFile={handleFileUpload}
                  />
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast / Snackbar */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-neutral-900/95 border border-neutral-800 p-3 rounded-md shadow">
              <div className="flex items-center gap-4">
                <div className="text-sm">{toast.message}</div>
                {toast.actionLabel && (
                  <button onClick={() => { toast.action && toast.action(); setToast(null); }} className="px-2 py-1 bg-blue-600 rounded text-xs">
                    {toast.actionLabel}
                  </button>
                )}
                <button onClick={() => setToast(null)} className="px-2 py-1 text-xs opacity-60">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================
   EditSongForm component
   - Used inside the side panel when editing a song
   ========================= */
function EditSongForm({ albumId, song, onSave, onCancel, onUploadFile }) {
  const [form, setForm] = useState({ ...song, _uploadFile: null });
  useEffect(() => setForm({ ...song, _uploadFile: null }), [song]);

  return (
    <div className="space-y-4">
      <label className="block text-xs text-gray-400">Title</label>
      <input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2 bg-gray-900 border border-neutral-800 rounded" />

      <label className="block text-xs text-gray-400">Embed HTML (iframe, spotify, youtube)</label>
      <textarea value={form.embed || ""} onChange={(e) => setForm({ ...form, embed: e.target.value })} rows={3} className="w-full p-2 bg-gray-900 border border-neutral-800 rounded" />

      <div className="text-xs text-gray-400">Or upload an audio file (mp3, m4a):</div>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            // stash the File object in the form state, onSave will handle upload
            setForm({ ...form, _uploadFile: f, src: "" });
          }
        }}
      />

      <label className="block text-xs text-gray-400">Story</label>
      <textarea value={form.story || ""} onChange={(e) => setForm({ ...form, story: e.target.value })} rows={6} className="w-full p-2 bg-gray-900 border border-neutral-800 rounded" />

      <label className="block text-xs text-gray-400">Lyrics</label>
      <textarea value={form.lyrics || ""} onChange={(e) => setForm({ ...form, lyrics: e.target.value })} rows={6} className="w-full p-2 bg-gray-900 border border-neutral-800 rounded" />

      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700">Save</button>
        <button onClick={() => onCancel()} className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700">Cancel</button>
        <div className="text-xs text-gray-400 ml-auto">Album: {albumId}</div>
      </div>
    </div>
  );
}