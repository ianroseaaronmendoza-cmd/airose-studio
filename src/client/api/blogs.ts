import axios from "axios";

/**
 * ✅ Universal API endpoint configuration
 * Handles React Router, CRA, and Vite builds safely.
 */
const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.replace(/\/$/, "")) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:4000/api";

const API_URL = `${BASE_URL}/blogs`;
console.log("🧩 API_URL =", API_URL);

/**
 * ✅ Blog type definition
 */
export interface Blog {
  id: number;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ✅ Fetch all blogs
 */
export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error("❌ Error fetching blogs:", err.message);
    throw new Error("Failed to load blogs");
  }
}

/**
 * ✅ Fetch single blog by slug
 */
export async function getBlog(slug: string): Promise<Blog> {
  try {
    const res = await axios.get(`${API_URL}/${slug}`, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error(`❌ Error fetching blog '${slug}':`, err.message);
    throw new Error("Failed to load blog");
  }
}

/**
 * ✅ Create a new blog
 */
export async function createBlog(data: {
  title: string;
  content: string;
  coverImage?: string;
}): Promise<Blog> {
  try {
    const res = await axios.post(API_URL, data, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error("❌ Error creating blog:", err.message);
    throw new Error("Failed to create blog");
  }
}

/**
 * ✅ Update an existing blog
 */
export async function updateBlog(
  slug: string,
  data: Partial<{ title: string; content: string; coverImage?: string }>
): Promise<Blog> {
  try {
    const res = await axios.put(`${API_URL}/${slug}`, data, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error(`❌ Error updating blog '${slug}':`, err.message);
    throw new Error("Failed to update blog");
  }
}

/**
 * ✅ Delete blog
 */
export async function deleteBlog(slug: string): Promise<{ ok: boolean }> {
  try {
    const res = await axios.delete(`${API_URL}/${slug}`, { withCredentials: true });
    return res.data;
  } catch (err: any) {
    console.error(`❌ Error deleting blog '${slug}':`, err.message);
    throw new Error("Failed to delete blog");
  }
}
