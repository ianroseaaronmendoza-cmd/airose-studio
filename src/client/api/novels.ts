import axios from "axios";
import { API_BASE } from "@/lib/config";

const API = `${API_BASE}/api/novels`;

export async function getAllNovels() {
  const res = await axios.get(API);
  return res.data;
}

export async function getNovel(slug: string) {
  const res = await axios.get(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}

export async function createNovel(payload: any) {
  const res = await axios.post(API, payload);
  return res.data;
}

export async function updateNovel(slug: string, payload: any) {
  const res = await axios.put(`${API}/${encodeURIComponent(slug)}`, payload);
  return res.data;
}

export async function deleteNovel(slug: string) {
  const res = await axios.delete(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}
