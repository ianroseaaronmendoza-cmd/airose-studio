"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "@/app/context/EditorContext";

/* =========================
   Default data (fallback)
   ========================= */
const DEFAULT_ALBUMS = [
  {
    id: "count-it-gain",
    title: "I Count It as Gain",
    year: 2025,
    cover: "",
    type: "album",
    songs: [
      {
        id: "count-it-gain-track",
        title: "I Count It as Gain",
        embed:
          `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/51qUsWUPNmdCwpEbWgpnBh?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`,
        story: "…",
        lyrics: "[Chorus] …"
      }
    ]
  }
];

/* =========================
   Local persistence keys & IDB helpers (unchanged)
   ========================= */
const LS_LOCAL = "music_local_v1";
const LS_DELETED = "music_deleted_v1";
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
   localStorage helpers & merge logic
   ========================= */
function loadLocal() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_LOCAL);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function persistLocal(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_LOCAL, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent("storage", { key: LS_LOCAL, newValue: JSON.stringify(data) }));
  } catch (e) {
    console.warn("persistLocal err", e);
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
    console.warn("persistDeleted failed", e);
  }
}

/* Merge base + local overrides while respecting deleted tombstones */
function buildMerged(baseAlbums, local, deleted) {
  const delAlbums = new Set((deleted && deleted.albums) || []);
  const deletedSongsMap = (deleted && deleted.songs) || {};

  const map = new Map();
  (baseAlbums || []).forEach((alb) => {
    if (!delAlbums.has(alb.id)) {
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
      (alb.songs || []).forEach((s) => songMap.set(s.id, { ...s })); // local overrides default
      map.set(alb.id, { ...existing, ...alb, songs: Array.from(songMap.values()) });
    }
  });

  return Array.from(map.values());
}

/* Utilities */
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
   Component starts here
   ========================= */
export default function Music() {
  const { editorMode } = useEditor();

  // baseAlbums: authoritative source from server (or DEFAULT_ALBUMS fallback)
  const [baseAlbums, setBaseAlbums] = useState(DEFAULT_ALBUMS);
  const [local, setLocal] = useState(null); // local overrides
  const [deleted, setDeleted] = useState({ albums: [], songs: {} });
  const [albums, setAlbums] = useState(DEFAULT_ALBUMS);
  const [openAlbumId, setOpenAlbumId] = useState(null);
  const [activeSong, setActiveSong] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const undoRef = useRef(null);
  const idbUrlsRef = useRef({});

  useEffect(() => {
    // load base dataset from server first (if available), then local values
    let mounted = true;
    async function loadBase() {
      try {
        const res = await fetch("/api/music/load");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data && data.albums) {
            setBaseAlbums(data.albums);
          }
        }
      } catch (e) {
        // ignore, keep DEFAULT_ALBUMS
      } finally {
        // local storage init (either way)
        const l = loadLocal();
        const d = loadDeleted();
        setLocal(l || []);
        setDeleted(d || { albums: [], songs: {} });
        setAlbums(buildMerged(mounted ? (baseAlbums || DEFAULT_ALBUMS) : DEFAULT_ALBUMS, l || [], d || { albums: [], songs: {} }));
      }
    }
    loadBase();

    const onStorage = (e) => {
      if (e.key === LS_LOCAL) {
        const l2 = loadLocal();
        setLocal(l2 || []);
        setAlbums(buildMerged(baseAlbums || DEFAULT_ALBUMS, l2 || [], loadDeleted() || { albums: [], songs: {} }));
      }
      if (e.key === LS_DELETED) {
        const d2 = loadDeleted();
        setDeleted(d2 || { albums: [], songs: {} });
        setAlbums(buildMerged(baseAlbums || DEFAULT_ALBUMS, loadLocal() || [], d2 || { albums: [], songs: {} }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAlbums(buildMerged(baseAlbums || DEFAULT_ALBUMS, local || [], deleted || { albums: [], songs: {} }));
  }, [baseAlbums, local, deleted]);

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

  /* ----------------------
     helper: resolve idb:// to object URL
     ---------------------- */
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
    return src;
  }

  /* ----------------------
     Server sync helper
     - posts merged albums to /api/music/save
     ---------------------- */
  async function syncToServer(mergedAlbums) {
    try {
      await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { albums: mergedAlbums } }),
      });
    } catch (e) {
      console.error("Server sync failed", e);
      // The UI still works offline — user can retry later
    }
  }

  /* =========================
     CRUD: createAlbum, createSingle, createSong, saveSongEdits, deleteSong, deleteAlbum, moveSong
     These functions update local + persistLocal + call syncToServer(...)
     ========================= */

  function createAlbum(title = "Untitled Album") {
    const newAlbum = { id: `alb-${uid("")}`, title, year: new Date().getFullYear(), type: "album", cover: "", songs: [] };
    const updated = [...(local || []), newAlbum];
    setLocal(updated);
    persistLocal(updated);
    setToast({ message: "Album created", actionLabel: "Open", action: () => setOpenAlbumId(newAlbum.id) });
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updated, deleted || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function createSingle(title = "Untitled Single") {
    const newSingle = {
      id: `single-${uid("")}`,
      title,
      year: new Date().getFullYear(),
      type: "single",
      cover: "",
      songs: [
        {
          id: `song-${uid("")}`,
          title,
          embed: "",
          src: "",
          story: "",
          lyrics: "",
        },
      ],
    };
    const updated = [...(local || []), newSingle];
    setLocal(updated);
    persistLocal(updated);
    setToast({ message: "Single created", actionLabel: "Open", action: () => setOpenAlbumId(newSingle.id) });
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updated, deleted || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function createSong(albumId) {
    const newSong = { id: `song-${uid("")}`, title: "Untitled", embed: "", src: "", story: "", lyrics: "" };
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      // local override exists
      const album = { ...updatedLocal[idx] };
      album.songs = [...(album.songs || []), newSong];
      // auto-promote single -> album
      if (album.type === "single") album.type = "album";
      updatedLocal[idx] = album;
    } else {
      // create local override for album (copy from merged if available)
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, title: albumId, songs: [] };
      const newSongs = [...(merged.songs || []), newSong];
      const newAlbum = { id: albumId, title: merged.title || albumId, year: merged.year || new Date().getFullYear(), type: merged.type === "single" && newSongs.length > 1 ? "album" : merged.type || "album", cover: merged.cover || "", songs: newSongs };
      updatedLocal.push(newAlbum);
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setEditing({ albumId, songId: newSong.id, isNew: true });
    openStoryPanel(newSong, false);
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updatedLocal, deleted || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function saveSongEdits(albumId, song) {
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: (updatedLocal[idx].songs || []).map((s) => (s.id === song.id ? song : s)) };
    } else {
      // create local override from merged plus change
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, songs: [] };
      const songs = (merged.songs || []).map((s) => (s.id === song.id ? song : s));
      if (!songs.some(s => s.id === song.id)) songs.push(song);
      updatedLocal.push({ id: albumId, title: merged.title, year: merged.year, cover: merged.cover, type: merged.type || "album", songs });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setToast({ message: "Saved", actionLabel: null, action: null });
    setEditing(null);
    if (activeSong && activeSong.id === song.id) setActiveSong(song);
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updatedLocal, deleted || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function deleteSong(albumId, songId) {
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

    // tombstone if exists in base
    const isBase = (baseAlbums || DEFAULT_ALBUMS).some((a) => a.id === albumId && (a.songs || []).some((s) => s.id === songId));
    if (isBase) {
      const deletedState = loadDeleted();
      const songsMap = { ...(deletedState.songs || {}) };
      const arr = new Set(songsMap[albumId] || []);
      arr.add(songId);
      songsMap[albumId] = Array.from(arr);
      const newDeleted = { ...deletedState, songs: songsMap };
      setDeleted(newDeleted);
      persistDeleted(newDeleted);
    }

    // schedule undo
    undoRef.current = {
      type: "deleteSong",
      payload: { albumId, song },
      revert: async () => {
        const curLocal = loadLocal() || [];
        const i = curLocal.findIndex((a) => a.id === albumId);
        if (i >= 0) {
          curLocal[i] = { ...curLocal[i], songs: [...(curLocal[i].songs || []), song] };
        } else {
          curLocal.push({ id: albumId, title: albums.find(a=>a.id===albumId)?.title || albumId, songs: [song] });
        }
        persistLocal(curLocal);
        setLocal(curLocal);
        const ds = loadDeleted();
        if ((ds.songs || {})[albumId]) {
          ds.songs[albumId] = (ds.songs[albumId] || []).filter((s) => s !== song.id);
          persistDeleted(ds);
          setDeleted(ds);
        }
      }
    };

    setToast({ message: "Song deleted", actionLabel: "Undo", action: () => handleUndo() });

    // finalize after timeout and sync
    setTimeout(async () => {
      if (undoRef.current && undoRef.current.type === "deleteSong" && undoRef.current.payload.albumId === albumId && undoRef.current.payload.song.id === songId) {
        // finalize deletion (delete blob)
        if (song.src && song.src.startsWith("idb://")) {
          const id = song.src.replace("idb://", "");
          await idbDelete(`music_blob:${id}`);
        }
        undoRef.current = null;
        setToast(null);
        // final sync
        const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, loadLocal() || [], loadDeleted() || { albums: [], songs: {} });
        syncToServer(merged);
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
    // sync after revert
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, loadLocal() || [], loadDeleted() || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function deleteAlbum(albumId) {
    const updatedLocal = (local || []).filter((a) => a.id !== albumId);
    setLocal(updatedLocal);
    persistLocal(updatedLocal);

    const isBase = (baseAlbums || DEFAULT_ALBUMS).some((a) => a.id === albumId);
    const ds = loadDeleted();
    const newDeleted = { ...ds, albums: ds.albums.includes(albumId) ? ds.albums : [...ds.albums, albumId] };
    setDeleted(newDeleted);
    persistDeleted(newDeleted);

    setToast({ message: "Album deleted", actionLabel: "Undo", action: handleUndo });

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

    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updatedLocal, loadDeleted() || { albums: [], songs: {} });
    syncToServer(merged);
  }

  function moveSong(albumId, songId, direction) {
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      const arr = [...(updatedLocal[idx].songs || [])];
      const i = arr.findIndex((s) => s.id === songId);
      if (i < 0) return;
      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return;
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      updatedLocal[idx] = { ...updatedLocal[idx], songs: arr };
      setLocal(updatedLocal);
      persistLocal(updatedLocal);
      const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, updatedLocal, deleted || { albums: [], songs: {} });
      syncToServer(merged);
      return;
    }

    const mergedAlb = albums.find((a) => a.id === albumId);
    if (!mergedAlb) return;
    const arr = [...(mergedAlb.songs || [])];
    const i = arr.findIndex((s) => s.id === songId);
    if (i < 0) return;
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    const newLocal = [...(local || []).filter(a=>a.id!==albumId), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, type: mergedAlb.type || "album", cover: mergedAlb.cover, songs: arr }];
    setLocal(newLocal);
    persistLocal(newLocal);
    const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, newLocal, deleted || { albums: [], songs: {} });
    syncToServer(merged);
  }

  /* Drag & drop handlers */
  function onDragStart(e, albumId, songId) {
    e.dataTransfer.setData("text/plain", JSON.stringify({ albumId, songId }));
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) { e.preventDefault(); }
  function onDrop(e, albumId, targetSongId) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!data) return;
      const { albumId: srcAlbumId, songId: srcSongId } = data;
      if (srcAlbumId !== albumId) return;
      const mergedAlb = albums.find((a) => a.id === albumId);
      if (!mergedAlb) return;
      const arr = [...(mergedAlb.songs || [])];
      const i = arr.findIndex((s) => s.id === srcSongId);
      const j = arr.findIndex((s) => s.id === targetSongId);
      if (i < 0 || j < 0) return;
      const item = arr.splice(i, 1)[0];
      arr.splice(j, 0, item);
      const newLocal = [...(local || []).filter(a=>a.id!==albumId), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, type: mergedAlb.type || "album", cover: mergedAlb.cover, songs: arr }];
      setLocal(newLocal);
      persistLocal(newLocal);
      const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, newLocal, deleted || { albums: [], songs: {} });
      syncToServer(merged);
    } catch {}
  }

  /* Import / Export */
  function exportAll() {
    const payload = { local: local || [], deleted: deleted || { albums: [], songs: {} }, timestamp: new Date().toISOString() };
    downloadJSON(`music-export-${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`, payload);
  }
  async function importFile(file) {
    try {
      const text = await file.text(); const parsed = JSON.parse(text);
      if (parsed.local) { setLocal(parsed.local); persistLocal(parsed.local); }
      if (parsed.deleted) { setDeleted(parsed.deleted); persistDeleted(parsed.deleted); }
      setToast({ message: "Import complete" });
      setTimeout(()=>setToast(null),2000);
      const merged = buildMerged(baseAlbums || DEFAULT_ALBUMS, parsed.local || [], parsed.deleted || { albums: [], songs: {} });
      syncToServer(merged);
    } catch (e) { setToast({ message: "Import failed" }); setTimeout(()=>setToast(null),2000); }
  }

  /* Edit UI helpers */
  const toggleAlbum = (id) => setOpenAlbumId((prev) => (prev === id ? null : id));
  const openStoryPanel = (song, openWithLyrics = false) => { setActiveSong(song); setShowLyrics(openWithLyrics); document.documentElement.style.overflow = "hidden"; };
  const closeStoryPanel = () => { setActiveSong(null); setShowLyrics(false); setEditing(null); document.documentElement.style.overflow = ""; };
  function startEditing(albumId, songId) {
    const alb = albums.find((a) => a.id === albumId);
    const song = alb?.songs?.find((s) => s.id === songId) || null;
    if (!song) return;
    setEditing({ albumId, songId, isNew: false });
    openStoryPanel(song, false);
  }

  async function handleFileUpload(albumId, songId, file) {
    if (!file) return;
    const key = await idbPut(`music_blob:${uid("")}`, file).then(()=>null).catch(()=>null);
    // simpler path: store file and then update on save (we already handle uploaded file in EditSongForm)
    // For compatibility, we'll handle file uploads inside onSave of EditSongForm.
  }

  /* Render helpers */
  function renderPlayback(song) {
    if (!song) return null;
    if (song.embed) return <div dangerouslySetInnerHTML={{ __html: song.embed }} />;
    if (song.src && typeof window !== "undefined") {
      if (song.src.startsWith("idb://")) {
        return <IDBAudio src={song.src} />;
      } else {
        return <audio controls src={song.src} className="w-full" />;
      }
    }
    return <div className="text-sm text-gray-400">No playable source available</div>;
  }

  function IDBAudio({ src }) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
      let mounted = true;
      (async () => {
        const res = await resolveSrcToUrl(src);
        if (mounted) setUrl(res);
      })();
      return () => { mounted = false; };
    }, [src]);
    if (!url) return <div className="text-sm text-gray-400">Loading audio…</div>;
    return <audio controls src={url} className="w-full" />;
  }

  /* =========================
     UI (keeps your existing layout)
     ========================= */
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto text-gray-100">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Music</h1>
          <p className="text-sm opacity-80 mt-1">Songs & stories — Airose listening diary.</p>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex gap-2">
            <button onClick={() => exportAll()} className="px-3 py-2 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900">Export</button>

            <label className="px-3 py-2 rounded-md border border-neutral-700 text-sm cursor-pointer hover:bg-neutral-900">
              Import
              <input type="file" accept="application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.currentTarget.value = ""; }} className="hidden" />
            </label>

            {editorMode && (
              <>
                <button onClick={() => createAlbum()} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm">+ Album</button>
                <button onClick={() => createSingle()} className="px-3 py-2 bg-pink-600 rounded hover:bg-pink-700 text-sm">+ Single</button>
                <button onClick={() => createSingle("New Song")} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm">+ Song</button>
              </>
            )}
          </div>

          <div className="text-xs text-gray-400">Editor Mode: {editorMode ? "ON" : "OFF"}</div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {albums.map((album) => (
          <div key={album.id} className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAlbum(album.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") toggleAlbum(album.id); }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-sm">
                  {album.cover ? <img src={album.cover} alt={album.title} className="w-full h-full object-cover rounded-lg" /> : <span className="text-xs opacity-80">{(album.songs||[]).length} tracks</span>}
                </div>

                <div>
                  <div className="font-semibold text-lg">{album.title}</div>
                  <div className="text-xs opacity-70">
                    {album.year} • {album.type === "single" ? "Single" : "Album"}
                  </div>
                </div>
              </div>

              <div className="text-sm opacity-80 flex items-center gap-3">
                <div>{openAlbumId === album.id ? "Hide" : "Open"}</div>
                {editorMode && (
                  <div className="flex items-center gap-2">
                    <button onClick={(ev) => { ev.stopPropagation(); createSong(album.id); }} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">+ Song</button>

                    <button onClick={(ev) => { ev.stopPropagation(); deleteAlbum(album.id); }} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {openAlbumId === album.id && (
                <motion.div key="songs" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden mt-4">
                  <div className="space-y-4">
                    {(album.songs || []).map((song) => (
                      <div key={song.id} className="bg-neutral-800/50 rounded-xl p-3" draggable={editorMode} onDragStart={(e) => onDragStart(e, album.id, song.id)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, album.id, song.id)}>
                        <div className="md:flex md:items-start md:gap-4 pr-2">
                          <div className="rounded-md overflow-hidden flex-1">
                            {renderPlayback(song)}
                          </div>

                          <div className="mt-3 md:mt-0 md:w-44">
                            <div className="font-medium">{song.title}</div>

                            <div className="flex gap-2 mt-2 flex-wrap">
                              <button onClick={() => openStoryPanel(song, false)} className="px-3 py-1 rounded-md bg-pink-500/80 hover:bg-pink-500 text-black text-sm font-medium transition">Story</button>

                              <button onClick={() => openStoryPanel(song, true)} className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-800 transition">Lyrics</button>
                            </div>

                            {editorMode && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button onClick={(ev) => { ev.stopPropagation(); startEditing(album.id, song.id); }} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">Edit</button>

                                <button onClick={(ev) => { ev.stopPropagation(); deleteSong(album.id, song.id); }} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>

                                <button onClick={(ev) => { ev.stopPropagation(); moveSong(album.id, song.id, "up"); }} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm" aria-label="Move up">▲</button>

                                <button onClick={(ev) => { ev.stopPropagation(); moveSong(album.id, song.id, "down"); }} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm" aria-label="Move down">▼</button>
                              </div>
                            )}
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

      {/* Side panel / story / edit */}
      <AnimatePresence>
        {activeSong && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={closeStoryPanel} className="fixed inset-0 bg-black z-40" />

            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 z-50 h-full w-full md:w-[42%] lg:w-[36%] bg-neutral-950/95 backdrop-blur flex flex-col" role="dialog" aria-modal="true">
              <div className="flex-shrink-0 p-6 flex items-start justify-between gap-4 border-b border-neutral-800/40">
                <div>
                  <h2 className="text-2xl font-semibold">{activeSong.title}</h2>
                  <p className="text-xs opacity-70 mt-1">Story & lyrics</p>
                </div>

                <div className="flex items-center gap-2">
                  {editing ? (
                    <button onClick={() => { setEditing(null); }} className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition">Close edit</button>
                  ) : (
                    editorMode && (
                      <button onClick={() => {
                        const album = albums.find((a) => (a.songs || []).some((s) => s.id === activeSong.id));
                        if (album) startEditing(album.id, activeSong.id);
                      }} className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition">Edit</button>
                    )
                  )}

                  <button onClick={() => setShowLyrics((s) => !s)} className="px-3 py-1 rounded-md border border-neutral-700 text-sm hover:bg-neutral-900 transition">{showLyrics ? "Hide lyrics" : "Show lyrics"}</button>

                  <button onClick={closeStoryPanel} aria-label="Close story panel" className="p-2 rounded-md hover:bg-neutral-900">✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
                <div className="rounded-lg overflow-hidden">{renderPlayback(activeSong)}</div>

                {editing && editing.songId === activeSong.id ? (
                  <EditSongForm
                    albumId={editing.albumId}
                    song={activeSong}
                    onSave={async (updated) => {
                      if (updated._uploadFile instanceof File) {
                        // store file and convert to idb://
                        const f = updated._uploadFile;
                        const key = `music_blob:${uid("")}`;
                        await idbPut(key, f);
                        updated = { ...updated, src: `idb://${key.replace("music_blob:","")}`, embed: "" };
                        delete updated._uploadFile;
                      }
                      saveSongEdits(editing.albumId, updated);
                      setActiveSong(updated);
                      setEditing(null);
                    }}
                    onCancel={() => { setEditing(null); }}
                    onUploadFile={handleFileUpload}
                  />
                ) : (
                  <>
                    {!showLyrics && <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">{activeSong.story}</div>}
                    {showLyrics && <div className="bg-neutral-900/40 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">{activeSong.lyrics || "Lyrics not available."}</div>}
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-neutral-900/95 border border-neutral-800 p-3 rounded-md shadow">
              <div className="flex items-center gap-4">
                <div className="text-sm">{toast.message}</div>
                {toast.actionLabel && (<button onClick={() => { toast.action && toast.action(); setToast(null); }} className="px-2 py-1 bg-blue-600 rounded text-xs">{toast.actionLabel}</button>)}
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
   EditSongForm component (unchanged behavior, but returns File object in _uploadFile)
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
      <input type="file" accept="audio/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setForm({ ...form, _uploadFile: f, src: "" }); } }} />

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
