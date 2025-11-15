import axios from "axios";
import { API_BASE } from "@/lib/config";

const BASE = `${API_BASE}/api/novels`;

export async function getChapters(novelSlug: string) {
  const res = await axios.get(`${BASE}/${encodeURIComponent(novelSlug)}/chapters`);
  return res.data;
}

export async function getChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.get(
    `${BASE}/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`
  );
  return res.data;
}

export async function createChapter(novelSlug: string, payload: any) {
  const res = await axios.post(`${BASE}/${encodeURIComponent(novelSlug)}/chapters`, payload);
  return res.data;
}

export async function updateChapter(novelSlug: string, chapterSlug: string, payload: any) {
  const res = await axios.put(
    `${BASE}/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
    payload
  );
  return res.data;
}

export async function deleteChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.delete(
    `${BASE}/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`
  );
  return res.data;
}

export async function reorderChapters(novelSlug: string, order: string[]) {
  const res = await axios.patch(
    `${BASE}/${encodeURIComponent(novelSlug)}/chapters/reorder`,
    { order }
  );
  return res.data;
}
