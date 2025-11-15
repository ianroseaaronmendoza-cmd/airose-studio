import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL (WORKS EVERYWHERE)
--------------------------------------------------------- */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://airose-studio.onrender.com/api"
    : "http://localhost:4000/api";

const API_URL = `${BASE_URL}/blogs`;
console.log("🧩 BLOG API_URL =", API_URL);

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
export interface Blog {
  id: number;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------------------------------------------------
   GET ALL BLOGS
--------------------------------------------------------- */
export async function getAllBlogs(): Promise<Blog[]> {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   GET ONE BLOG
--------------------------------------------------------- */
export async function getBlog(slug: string): Promise<Blog> {
  const res = await axios.get(`${API_URL}/${slug}`, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   CREATE BLOG
--------------------------------------------------------- */
export async function createBlog(data: {
  title: string;
  content: string;
  coverImage?: string;
}): Promise<Blog> {
  const res = await axios.post(API_URL, data, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   UPDATE BLOG
--------------------------------------------------------- */
export async function updateBlog(
  slug: string,
  data: Partial<{ title: string; content: string; coverImage?: string }>
): Promise<Blog> {
  const res = await axios.put(`${API_URL}/${slug}`, data, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   DELETE BLOG
--------------------------------------------------------- */
export async function deleteBlog(slug: string): Promise<{ ok: boolean }> {
  const res = await axios.delete(`${API_URL}/${slug}`, { withCredentials: true });
  return res.data;
}
