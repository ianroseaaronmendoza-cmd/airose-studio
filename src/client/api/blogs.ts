// src/client/api/blogs.ts

export interface Blog {
  slug: string;
  title: string;
  excerpt?: string; // ✅ Add this line - optional excerpt for blog previews
  content: string;
  date: string; // Publication date
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

const isDev =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.MODE === "development") ||
  process.env.NODE_ENV === "development";

/** Load all blogs from static JSON */
export async function loadBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch("/data/blogs/index.json", { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Blog[];
  } catch (err) {
    console.error("loadBlogs failed:", err);
    return [];
  }
}

/** Load a single blog from static JSON */
export async function loadBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`/data/blogs/${slug}.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Blog;
  } catch (err) {
    console.error("loadBlog failed:", err);
    return null;
  }
}

/** Save blog (DEV ONLY) */
export async function saveBlog(blog: Blog): Promise<Blog> {
  if (!isDev) throw new Error("saveBlog is allowed only in development.");

  const res = await fetch("/dev/blog/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blog),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to save blog");
  }

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Unknown save error");

  return json.saved as Blog;
}

/** Delete blog (DEV ONLY) */
export async function deleteBlog(slug: string): Promise<void> {
  if (!isDev) throw new Error("deleteBlog is allowed only in development.");

  const res = await fetch("/dev/blog/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete blog");
  }
}
