import axios from "axios";

const BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL?.replace(/\/$/, "")) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:4000/api";

const API = `${BASE}/novels`;

export type Novel = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  note?: string;
  coverUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  chapters?: any[];
};

export async function getAllNovels(): Promise<Novel[]> {
  const res = await axios.get(API, { withCredentials: true });
  return res.data;
}

export async function getNovel(slug: string): Promise<Novel> {
  const res = await axios.get(`${API}/${encodeURIComponent(slug)}`, { withCredentials: true });
  return res.data;
}

export async function createNovel(payload: Partial<Novel>): Promise<Novel> {
  const res = await axios.post(API, payload, { withCredentials: true });
  return res.data;
}

export async function updateNovel(slug: string, payload: Partial<Novel>): Promise<Novel> {
  const res = await axios.put(`${API}/${encodeURIComponent(slug)}`, payload, { withCredentials: true });
  return res.data;
}

export async function deleteNovel(slug: string): Promise<any> {
  const res = await axios.delete(`${API}/${encodeURIComponent(slug)}`, { withCredentials: true });
  return res.data;
}
