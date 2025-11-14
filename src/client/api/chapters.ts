import axios from "axios";

const BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.replace(/\/$/, "")) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:4000/api";

export async function getChapters(novelSlug: string) {
  const res = await axios.get(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters`, { withCredentials: true });
  return res.data;
}

export async function getChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.get(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`, { withCredentials: true });
  return res.data;
}

export async function createChapter(novelSlug: string, payload: { title?: string; slug?: string; body?: string }) {
  const res = await axios.post(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters`, payload, { withCredentials: true });
  return res.data;
}

export async function updateChapter(novelSlug: string, chapterSlug: string | number, payload: Partial<{ title: string; body: string; slug?: string }>) {
  const res = await axios.put(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(String(chapterSlug))}`, payload, { withCredentials: true });
  return res.data;
}

export async function deleteChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.delete(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`, { withCredentials: true });
  return res.data;
}

export async function reorderChapters(novelSlug: string, order: string[]) {
  const res = await axios.patch(`${BASE}/novels/${encodeURIComponent(novelSlug)}/chapters/reorder`, { order }, { withCredentials: true });
  return res.data;
}
