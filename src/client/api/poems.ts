export interface Poem {
  slug: string;
  title: string;
  content: string;
  createdAt: number;
}

const isDev =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.MODE === "development") ||
  process.env.NODE_ENV === "development";

/** List */
export async function getAllPoems(): Promise<Poem[]> {
  try {
    const res = await fetch("/data/poems/index.json");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Single */
export async function getPoem(slug: string): Promise<Poem | null> {
  try {
    const res = await fetch(`/data/poems/${slug}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Create */
export async function createPoem(data: Omit<Poem, "createdAt">) {
  if (!isDev) throw new Error("Cannot create poem in production.");
  const res = await fetch("/dev/poem/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, createdAt: Date.now() }),
  });
  return res.json();
}

/** Update */
export async function updatePoem(slug: string, data: Partial<Poem>) {
  if (!isDev) throw new Error("Cannot update poem in production.");
  const res = await fetch("/dev/poem/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, slug }),
  });
  return res.json();
}

/** Delete */
export async function deletePoem(slug: string) {
  if (!isDev) throw new Error("Cannot delete poem in production.");
  const res = await fetch("/dev/poem/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  return res.json();
}

/** Slugify helper */
export function slugifyText(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-");
}
