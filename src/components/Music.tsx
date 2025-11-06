import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor } from "../context/EditorContext";

/* ------------------------------ IndexedDB Setup ------------------------------ */
const IDB_DB = "music_db_v1";
const IDB_STORE = "blobs";

function openIDB(): Promise<IDBDatabase> {
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

async function idbPut(key: string, blob: any): Promise<boolean> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const r = store.put(blob, key);
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

async function idbGet(key: string): Promise<any | null> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const store = tx.objectStore(IDB_STORE);
    const r = store.get(key);
    r.onsuccess = () => resolve(r.result || null);
    r.onerror = () => reject(r.error);
  });
}

async function idbDelete(key: string): Promise<boolean> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    const r = store.delete(key);
    r.onsuccess = () => resolve(true);
    r.onerror = () => reject(r.error);
  });
}

/* ------------------------------ LocalStorage Helpers ------------------------------ */
const LS_LOCAL = "music_local_v1";
const LS_DELETED = "music_deleted_v1";

function loadLocal(): any[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_LOCAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistLocal(data: any) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(LS_LOCAL, json);
    window.dispatchEvent(new StorageEvent("storage", { key: LS_LOCAL, newValue: json }));
  } catch {}
}

function loadDeleted(): { albums: string[]; songs: Record<string, string[]> } {
  if (typeof window === "undefined") return { albums: [], songs: {} };
  try {
    const raw = localStorage.getItem(LS_DELETED);
    return raw ? JSON.parse(raw) : { albums: [], songs: {} };
  } catch {
    return { albums: [], songs: {} };
  }
}

function persistDeleted(obj: { albums: string[]; songs: Record<string, string[]> }) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(obj);
    localStorage.setItem(LS_DELETED, json);
    window.dispatchEvent(new StorageEvent("storage", { key: LS_DELETED, newValue: json }));
  } catch {}
}

/* ------------------------------ Utilities ------------------------------ */
const uid = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

function downloadJSON(filename: string, obj: any) {
  const data = JSON.stringify(obj, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const FALLBACK_DEFAULTS = [
  {
    id: "sample-album",
    title: "Ikaw Lang, Hesus",
    year: new Date().getFullYear(),
    cover: "",
    songs: [{ id: "1", title: "Ikaw Lang, Hesus", length: "4:25" }],
  },
];

function buildMerged(defaults: any[], local: any[], deleted: any) {
  const delAlbums = new Set((deleted && deleted.albums) || []);
  const deletedSongsMap = (deleted && deleted.songs) || {};
  const map = new Map();
  (defaults || []).forEach((alb) => {
    if (!delAlbums.has(alb.id)) {
      const defaultSongs = (alb.songs || []).filter((s: any) => {
        const delForAlbum = new Set(deletedSongsMap[alb.id] || []);
        return !delForAlbum.has(s.id);
      });
      map.set(alb.id, { ...alb, songs: defaultSongs.map((s: any) => ({ ...s })) });
    }
  });
  (local || []).forEach((alb) => {
    if (!delAlbums.has(alb.id)) {
      const existing = map.get(alb.id) || {
        id: alb.id,
        title: alb.title,
        year: alb.year,
        cover: alb.cover,
        songs: [],
      };
      const songMap = new Map();
      (existing.songs || []).forEach((s: any) => songMap.set(s.id, { ...s }));
      (alb.songs || []).forEach((s: any) => songMap.set(s.id, { ...s }));
      map.set(alb.id, { ...existing, ...alb, songs: Array.from(songMap.values()) });
    }
  });
  return Array.from(map.values());
}

/* ------------------------------ Component ------------------------------ */
export default function Music({ initialAlbums = null }: { initialAlbums?: any[] | null }) {
  const { isAuthenticated, editorMode } = useEditor();

  const [defaultAlbums, setDefaultAlbums] = useState<any[] | null>(null);
  const [local, setLocal] = useState<any[] | null>(null);
  const [deleted, setDeleted] = useState<{ albums: string[]; songs: Record<string, string[]> }>({
    albums: [],
    songs: {},
  });
  const [albums, setAlbums] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; actionLabel: string | null } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load default albums
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/data/music.json", { cache: "no-store" });
        if (!res.ok) throw new Error("no local data");
        const json = await res.json();
        if (mounted) setDefaultAlbums(json.albums || json || []);
      } catch {
        if (mounted) setDefaultAlbums(FALLBACK_DEFAULTS);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const l = loadLocal();
    const d = loadDeleted();
    setLocal(l || []);
    setDeleted(d || { albums: [], songs: {} });
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_LOCAL) setLocal(loadLocal() || []);
      if (e.key === LS_DELETED) setDeleted(loadDeleted() || { albums: [], songs: {} });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const def = defaultAlbums || FALLBACK_DEFAULTS;
    setAlbums(buildMerged(def, local || [], deleted || { albums: [], songs: {} }));
  }, [defaultAlbums, local, deleted]);

  async function syncToServer(albumsData: any[]) {
    try {
      setIsSyncing(true);
      const res = await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albums: albumsData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Sync failed");
      setToast({ message: "✅ Music updated instantly", actionLabel: null });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ message: `❌ Sync failed: ${err.message}`, actionLabel: null });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }

  /* ------------------------------ Render Logic ------------------------------ */
  if (!isAuthenticated || !editorMode) {
    // Public-facing display
    return (
      <div className="p-6 text-gray-200">
        <h2 className="text-3xl font-bold mb-4 text-pink-400">🎵 Featured Music</h2>
        <p className="text-sm text-gray-400 mb-8">
          Explore Airose Studio’s highlighted releases and music projects.
        </p>
        {albums.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <motion.div
                key={album.id}
                whileHover={{ scale: 1.02 }}
                className="bg-[#111] rounded-xl border border-gray-800 hover:border-pink-500 transition shadow-md p-4"
              >
                <h3 className="text-lg font-semibold text-pink-400 mb-2">{album.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{album.year}</p>
                {album.songs?.length ? (
                  <ul className="text-sm text-gray-300 space-y-1">
                    {album.songs.map((s: any) => (
                      <li key={s.id}>• {s.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No songs available.</p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No albums available.</p>
        )}
      </div>
    );
  }

  // Editor-only view
  return (
    <div className="p-6 text-gray-200">
      <h2 className="text-xl font-semibold mb-3">🎵 Music Manager</h2>
      <p className="text-sm text-gray-400 mb-4">
        Local + instant reflection system with IndexedDB and auto-sync.
      </p>
      <button
        onClick={() => syncToServer(albums)}
        disabled={isSyncing}
        className={`px-4 py-2 rounded ${
          isSyncing ? "bg-gray-500" : "bg-pink-600 hover:bg-pink-500"
        }`}
      >
        {isSyncing ? "Syncing..." : "Sync Now"}
      </button>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-4 right-4 bg-gray-800 px-4 py-2 rounded text-sm shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
