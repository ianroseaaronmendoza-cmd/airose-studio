// components/music.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "@/app/context/EditorContext";

/**
 * components/music.jsx (Final — Manual GitHub Sync Edition)
 *
 * - Manual "Sync Now" button (editor mode) to POST albums -> /api/music/save
 * - Success/failure toast feedback
 * - Public view loads from /data/music.json
 * - Editor mode keeps localStorage overrides and tombstones
 * - All UI / side panel / features preserved
 */

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

/* ====== Default fallback (used if /data/music.json can't be fetched) ====== */
const FALLBACK_DEFAULTS = [
  {
    id: "sample-album",
    title: "Untitled Album",
    year: new Date().getFullYear(),
    cover: "",
    songs: [],
  },
];

/* =========================
   Merge defaults + local overrides while respecting deleted tombstones
   ========================= */
function buildMerged(defaults, local, deleted) {
  const delAlbums = new Set((deleted && deleted.albums) || []);
  const deletedSongsMap = (deleted && deleted.songs) || {};

  const map = new Map();
  (defaults || []).forEach((alb) => {
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
      (alb.songs || []).forEach((s) => songMap.set(s.id, { ...s }));
      map.set(alb.id, { ...existing, ...alb, songs: Array.from(songMap.values()) });
    }
  });

  return Array.from(map.values());
}

/* =========================
   Component
   ========================= */
export default function Music({ initialAlbums = null }) {
  const { editorMode } = useEditor();

  const [defaultAlbums, setDefaultAlbums] = useState(null); // loaded from /data/music.json or fallback
  const [local, setLocal] = useState(null); // local overrides
  const [deleted, setDeleted] = useState({ albums: [], songs: {} });
  const [albums, setAlbums] = useState([]);
  const [openAlbumId, setOpenAlbumId] = useState(null);
  const [activeSong, setActiveSong] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [editingSong, setEditingSong] = useState(null); // { albumId, songId, isNew }
  const [editingAlbum, setEditingAlbum] = useState(null); // { albumId, title, year }
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const undoRef = useRef(null);
  const idbUrlsRef = useRef({});

  // Load default albums from /data/music.json
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (initialAlbums && initialAlbums.length > 0) {
        setDefaultAlbums(initialAlbums);
        return;
      } 
      const res = await fetch(
        "https://raw.githubusercontent.com/ianroseaaronmendoza-cmd/airose-studio/main/data/music.json",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("no remote data");
      const json = await res.json();
      if (!mounted) return;
      setDefaultAlbums(json.albums || json || []);
    } catch (e) {
      console.warn("music.jsx: using fallback defaults", e);
      setDefaultAlbums(FALLBACK_DEFAULTS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // initial load of local + deleted storage and merged albums
  useEffect(() => {
    const l = loadLocal();
    const d = loadDeleted();
    setLocal(l || []);
    setDeleted(d || { albums: [], songs: {} });
    // albums will be computed in next effect once defaultAlbums is known
    const onStorage = (e) => {
      if (e.key === LS_LOCAL) {
        const l2 = loadLocal();
        setLocal(l2 || []);
      }
      if (e.key === LS_DELETED) {
        const d2 = loadDeleted();
        setDeleted(d2 || { albums: [], songs: {} });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // recompute merged albums when defaults/local/deleted change
  useEffect(() => {
    const def = defaultAlbums || FALLBACK_DEFAULTS;
    setAlbums(buildMerged(def, local || [], deleted || { albums: [], songs: {} }));
  }, [defaultAlbums, local, deleted]);

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

  // UI helpers
  const toggleAlbum = (id) => setOpenAlbumId((prev) => (prev === id ? null : id));

  const openStoryPanel = (song, openWithLyrics = false) => {
    setActiveSong(song);
    setShowLyrics(openWithLyrics);
    document.documentElement.style.overflow = "hidden";
  };

  const closeStoryPanel = () => {
    setActiveSong(null);
    setShowLyrics(false);
    setEditingSong(null);
    setEditingAlbum(null);
    document.documentElement.style.overflow = "";
  };

  // IDB upload helpers
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

  // Manual sync helper (calls your /api/music/save route)
  async function syncToServer(albumsData) {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums: albumsData }),
      });
      const json = await res.json();
      if (!res.ok) {
        const err = json?.error || "Sync failed";
        setToast({ message: `Sync failed: ${err}`, actionLabel: null, action: null });
        setTimeout(() => setToast(null), 4000);
        console.warn("Server sync failed:", json);
      } else {
        setToast({ message: "✅ Music synced to GitHub", actionLabel: null, action: null });
        setTimeout(() => setToast(null), 3000);
        console.log("✅ Synced to GitHub");
      }
    } catch (err) {
      console.warn("Server sync failed:", err);
      setToast({ message: `Sync failed: ${err?.message || err}`, actionLabel: null, action: null });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }

  // CRUD operations (local first)
  function createAlbum(title = "Untitled Album", year = new Date().getFullYear(), isSingle = false) {
    const newAlbum = { id: `alb-${uid("")}`, title, year, cover: "", songs: [], single: !!isSingle };
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
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, title: albumId, songs: [] };
      updatedLocal.push({ id: albumId, title: merged.title, year: merged.year, cover: merged.cover, songs: [...(merged.songs || []), newSong] });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setEditingSong({ albumId, songId: newSong.id, isNew: true });
    openStoryPanel(newSong, false);
  }

  function saveSongEdits(albumId, song) {
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: (updatedLocal[idx].songs || []).map((s) => (s.id === song.id ? song : s)) };
    } else {
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, songs: [] };
      updatedLocal.push({
        id: albumId,
        title: merged.title,
        year: merged.year,
        cover: merged.cover,
        songs: (merged.songs || []).map((s) => (s.id === song.id ? song : s)).concat((merged.songs || []).some(s => s.id === song.id) ? [] : [song]),
      });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setToast({ message: "Saved", actionLabel: null, action: null });
    setEditingSong(null);
    setActiveSong(song);
  }

  function deleteSong(albumId, songId) {
    const mergedAlbum = albums.find((a) => a.id === albumId) || null;
    const song = mergedAlbum?.songs?.find((s) => s.id === songId) || null;
    if (!song) return;

    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], songs: (updatedLocal[idx].songs || []).filter((s) => s.id !== songId) };
      setLocal(updatedLocal);
      persistLocal(updatedLocal);
    }

    const isDefault = (defaultAlbums || []).some((a) => a.id === albumId && (a.songs || []).some((s) => s.id === songId));
    const deletedState = loadDeleted();
    const songsMap = { ...(deletedState.songs || {}) };
    if (isDefault) {
      const arr = new Set(songsMap[albumId] || []);
      arr.add(songId);
      songsMap[albumId] = Array.from(arr);
      const newDeleted = { ...deletedState, songs: songsMap };
      setDeleted(newDeleted);
      persistDeleted(newDeleted);
    }

    // schedule undo and finalize blob delete
    undoRef.current = {
      type: "deleteSong",
      payload: { albumId, song },
      revert: async () => {
        const curLocal = loadLocal() || [];
        const i = curLocal.findIndex((a) => a.id === albumId);
        if (i >= 0) {
          curLocal[i] = { ...curLocal[i], songs: [...(curLocal[i].songs || []), song] };
        } else {
          curLocal.push({ id: albumId, title: albums.find(a => a.id === albumId)?.title || albumId, songs: [song] });
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

    setTimeout(async () => {
      if (undoRef.current && undoRef.current.type === "deleteSong" && undoRef.current.payload.albumId === albumId && undoRef.current.payload.song.id === songId) {
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
    const updatedLocal = (local || []).filter((a) => a.id !== albumId);
    setLocal(updatedLocal);
    persistLocal(updatedLocal);

    const isDefault = (defaultAlbums || []).some((a) => a.id === albumId);
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
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      updatedLocal[idx] = { ...updatedLocal[idx], songs: arr };
      setLocal(updatedLocal);
      persistLocal(updatedLocal);
      return;
    }

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
    const newLocal = [...(local || []).filter(a => a.id !== albumId), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, cover: mergedAlb.cover, songs: arr }];
    setLocal(newLocal);
    persistLocal(newLocal);
  }

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
      if (srcAlbumId !== albumId) return;
      const mergedAlb = albums.find((a) => a.id === albumId);
      if (!mergedAlb) return;
      const arr = [...(mergedAlb.songs || [])];
      const i = arr.findIndex((s) => s.id === srcSongId);
      const j = arr.findIndex((s) => s.id === targetSongId);
      if (i < 0 || j < 0) return;
      const item = arr.splice(i, 1)[0];
      arr.splice(j, 0, item);
      const newLocal = [...(local || []).filter(a=>a.id!==albumId), { id: albumId, title: mergedAlb.title, year: mergedAlb.year, cover: mergedAlb.cover, songs: arr }];
      setLocal(newLocal);
      persistLocal(newLocal);
    } catch (err) {
      // ignore
    }
  }

  // Import/Export
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

  // album editing (title/year)
  function startAlbumEdit(albumId) {
    const alb = albums.find((a) => a.id === albumId) || { id: albumId, title: "Untitled", year: new Date().getFullYear() };
    setEditingAlbum({ albumId: alb.id, title: alb.title || "", year: alb.year || new Date().getFullYear() });
  }

  function saveAlbumEdits() {
    if (!editingAlbum) return;
    const { albumId, title, year } = editingAlbum;
    const updatedLocal = [...(local || [])];
    const idx = updatedLocal.findIndex((a) => a.id === albumId);
    if (idx >= 0) {
      updatedLocal[idx] = { ...updatedLocal[idx], title, year };
    } else {
      const merged = albums.find((a) => a.id === albumId) || { id: albumId, songs: [] };
      updatedLocal.push({ id: albumId, title, year, cover: merged.cover || "", songs: merged.songs || [] });
    }
    setLocal(updatedLocal);
    persistLocal(updatedLocal);
    setEditingAlbum(null);
    setToast({ message: "Album saved", actionLabel: null, action: null });
    setTimeout(() => setToast(null), 1200);
  }

  // edit song entry point
  function startEditing(albumId, songId) {
    const alb = albums.find((a) => a.id === albumId);
    const song = alb?.songs?.find((s) => s.id === songId) || null;
    if (!song) return;
    setEditingSong({ albumId, songId, isNew: false });
    openStoryPanel(song, false);
  }

  async function handleFileUpload(albumId, songId, file) {
    if (!file) return;
    const idKey = await storeUploadGetId(file); // returns key like music_blob:<id>
    const id = idKey.replace("music_blob:", "");
    const mergedAlb = albums.find((a) => a.id === albumId);
    const song = mergedAlb?.songs?.find((s) => s.id === songId);
    if (!song) return;
    const updatedSong = { ...song, src: `idb://${id}`, embed: "" };
    saveSongEdits(albumId, updatedSong);
  }

  // Playback render helper & IDBAudio subcomponent
  function renderPlayback(song) {
    if (song.embed) {
      return <div dangerouslySetInnerHTML={{ __html: song.embed }} />;
    }
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
      return () => {
        mounted = false;
      };
    }, [src]);
    if (!url) return <div className="text-sm text-gray-400">Loading audio…</div>;
    return <audio controls src={url} className="w-full" />;
  }

  /* =========================
     Render UI
     ========================= */
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-gray-100">
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
              <>
                <button onClick={() => createAlbum("Untitled Album")} className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm">+ Album</button>
                <button onClick={() => createAlbum("Untitled Single", new Date().getFullYear(), true)} className="px-3 py-2 bg-pink-600 rounded hover:bg-pink-700 text-sm">+ Single</button>
                <button onClick={() => {
                  // global add song: if there are no albums, create an album first
                  if (albums.length === 0) {
                    createAlbum("Untitled Album");
                    setTimeout(() => {
                      const first = (local || []).slice(-1)[0];
                      if (first) createSong(first.id);
                    }, 200);
                  } else {
                    // add to first album by default
                    createSong(albums[0].id);
                  }
                }} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm">+ Song</button>

                {/* Sync Now — manual commit to GitHub */}
                <button
                  onClick={() => syncToServer(albums)}
                  disabled={isSyncing}
                  className={`px-3 py-2 rounded-md text-sm ${isSyncing ? "bg-yellow-700 opacity-80" : "bg-yellow-600 hover:bg-yellow-700"}`}
                >
                  {isSyncing ? "Syncing…" : "Sync Now"}
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-gray-400">Editor Mode: {editorMode ? "ON" : "OFF"}</div>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {albums.map((album) => (
          <div key={album.id} className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleAlbum(album.id)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-sm">
                  {album.cover ? (
                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-xs opacity-80">{(album.songs || []).length} tracks</span>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-lg">{album.title}</div>
                  <div className="text-xs opacity-70">{album.year} • {album.single ? "Single" : "Album"}</div>
                </div>
              </div>

              <div className="text-sm opacity-80 flex items-center gap-3">
                <div>{openAlbumId === album.id ? "Hide" : "Open"}</div>
                {editorMode && (
                  <div className="flex items-center gap-2">
                    <button onClick={(ev) => { ev.stopPropagation(); startAlbumEdit(album.id); }} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">Edit</button>

                    <button onClick={(ev) => { ev.stopPropagation(); createSong(album.id); }} className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm">+ Song</button>

                    <button onClick={(ev) => { ev.stopPropagation(); deleteAlbum(album.id); }} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {openAlbumId === album.id && (
                <motion.div key="songs" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mt-4">
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
                              <button onClick={() => openStoryPanel(song, false)} className="px-3 py-1 rounded-md bg-pink-500/80 text-black text-sm font-medium">Story</button>
                              <button onClick={() => openStoryPanel(song, true)} className="px-3 py-1 rounded-md border border-neutral-700 text-sm">Lyrics</button>
                            </div>

                            {editorMode && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button onClick={(ev) => { ev.stopPropagation(); startEditing(album.id, song.id); }} className="px-2 py-1 bg-blue-600 rounded text-sm">Edit</button>
                                <button onClick={(ev) => { ev.stopPropagation(); deleteSong(album.id, song.id); }} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
                                <button onClick={(ev) => { ev.stopPropagation(); moveSong(album.id, song.id, "up"); }} className="px-2 py-1 bg-gray-700 rounded text-sm">▲</button>
                                <button onClick={(ev) => { ev.stopPropagation(); moveSong(album.id, song.id, "down"); }} className="px-2 py-1 bg-gray-700 rounded text-sm">▼</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!album.songs || album.songs.length === 0) && <div className="text-sm text-gray-400 p-3">No songs yet.</div>}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={closeStoryPanel} className="fixed inset-0 bg-black z-40" />

            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 z-50 h-full w-full md:w-[42%] lg:w-[36%] bg-neutral-950/95 backdrop-blur flex flex-col" role="dialog" aria-modal="true">
              <div className="flex-shrink-0 p-6 flex items-start justify-between gap-4 border-b border-neutral-800/40">
                <div>
                  <h2 className="text-2xl font-semibold">{activeSong.title}</h2>
                  <p className="text-xs opacity-70 mt-1">Story & lyrics</p>
                </div>

                <div className="flex items-center gap-2">
                  {editingSong ? (
                    <button onClick={() => setEditingSong(null)} className="px-3 py-1 rounded-md border border-neutral-700 text-sm">Close edit</button>
                  ) : (
                    editorMode && <button onClick={() => {
                      const album = albums.find((a) => (a.songs || []).some((s) => s.id === activeSong.id));
                      if (album) startEditing(album.id, activeSong.id);
                    }} className="px-3 py-1 rounded-md border border-neutral-700 text-sm">Edit</button>
                  )}

                  <button onClick={() => setShowLyrics((s) => !s)} className="px-3 py-1 rounded-md border border-neutral-700 text-sm">{showLyrics ? "Hide lyrics" : "Show lyrics"}</button>

                  <button onClick={closeStoryPanel} aria-label="Close story panel" className="p-2 rounded-md hover:bg-neutral-900">✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
                <div className="rounded-lg overflow-hidden">
                  {renderPlayback(activeSong)}
                </div>

                {editingSong && editingSong.songId === activeSong.id ? (
                  <EditSongForm
                    albumId={editingSong.albumId}
                    song={activeSong}
                    onSave={async (updated) => {
                      if (updated._uploadFile instanceof File) {
                        const key = await storeUploadGetId(updated._uploadFile);
                        const id = key.replace("music_blob:", "");
                        updated = { ...updated, src: `idb://${id}`, embed: "" };
                        delete updated._uploadFile;
                      }
                      saveSongEdits(editingSong.albumId, updated);
                      setActiveSong(updated);
                      setEditingSong(null);
                    }}
                    onCancel={() => setEditingSong(null)}
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

      {/* ALBUM EDIT MODAL (inline) */}
      <AnimatePresence>
        {editingAlbum && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setEditingAlbum(null)} className="fixed inset-0 bg-black z-40" />
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed z-50 right-4 top-20 w-96 bg-neutral-900/95 border border-neutral-800 rounded p-4">
              <div className="text-sm text-gray-300 mb-2">Edit Album</div>
              <input className="w-full p-2 bg-gray-900 border border-neutral-800 rounded mb-2" value={editingAlbum.title} onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })} />
              <input className="w-full p-2 bg-gray-900 border border-neutral-800 rounded mb-2" type="number" value={editingAlbum.year} onChange={(e) => setEditingAlbum({ ...editingAlbum, year: Number(e.target.value) })} />
              <div className="flex gap-2">
                <button onClick={saveAlbumEdits} className="px-3 py-2 bg-green-600 rounded">Save</button>
                <button onClick={() => setEditingAlbum(null)} className="px-3 py-2 bg-gray-800 rounded">Cancel</button>
              </div>
            </motion.div>
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
                {toast.actionLabel && <button onClick={() => { toast.action && toast.action(); setToast(null); }} className="px-2 py-1 bg-blue-600 rounded text-xs">{toast.actionLabel}</button>}
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
   EditSongForm component (used in side panel)
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
      <input type="file" accept="audio/*" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) {
          setForm({ ...form, _uploadFile: f, src: "" });
        }
      }} />

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
