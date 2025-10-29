// app/lib/localStore.ts
export type WritingItem = {
  slug: string;
  title?: string;
  date?: string;
  content?: string;
  description?: string;
  chapters?: any[];
};

function safeParse<T>(raw: string | null): T | [] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T;
  } catch {
    return [];
  }
}

export function loadFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  return safeParse<T[]>(localStorage.getItem(key));
}

export function saveToStorage<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function removeFromStorage(key: string, slug: string) {
  if (typeof window === "undefined") return;
  const data = loadFromStorage<any>(key).filter((item) => item.slug !== slug);
  saveToStorage(key, data);
}

export function markDeleted(slug: string, deletedKey: string) {
  if (typeof window === "undefined") return;
  const deleted = loadFromStorage<string>(deletedKey);
  if (!deleted.includes(slug)) {
    deleted.push(slug);
    saveToStorage(deletedKey, deleted);
  }
}

export function mergeData<T extends { slug: string }>(
  defaults: T[],
  local: T[],
  deleted: string[]
): T[] {
  const del = new Set(deleted);
  const map = new Map<string, T>();

  defaults.forEach((d) => {
    if (!del.has(d.slug)) map.set(d.slug, d);
  });

  local.forEach((l) => {
    if (!del.has(l.slug)) map.set(l.slug, l);
  });

  return Array.from(map.values());
}
