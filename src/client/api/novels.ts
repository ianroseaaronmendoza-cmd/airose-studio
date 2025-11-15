import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL (WORKS IN DEV + RENDER)
--------------------------------------------------------- */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://airose-studio.onrender.com/api"
    : "http://localhost:4000/api";

const API = `${BASE_URL}/novels`;

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   GET ALL NOVELS
--------------------------------------------------------- */
export async function getAllNovels(): Promise<Novel[]> {
  const res = await axios.get(API, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   GET ONE NOVEL
--------------------------------------------------------- */
export async function getNovel(slug: string): Promise<Novel> {
  const res = await axios.get(`${API}/${encodeURIComponent(slug)}`, {
    withCredentials: true,
  });
  return res.data;
}

/* ---------------------------------------------------------
   CREATE NOVEL
--------------------------------------------------------- */
export async function createNovel(payload: Partial<Novel>): Promise<Novel> {
  const res = await axios.post(API, payload, { withCredentials: true });
  return res.data;
}

/* ---------------------------------------------------------
   UPDATE NOVEL
--------------------------------------------------------- */
export async function updateNovel(
  slug: string,
  payload: Partial<Novel>
): Promise<Novel> {
  const res = await axios.put(
    `${API}/${encodeURIComponent(slug)}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

/* ---------------------------------------------------------
   DELETE NOVEL
--------------------------------------------------------- */
export async function deleteNovel(slug: string): Promise<any> {
  const res = await axios.delete(
    `${API}/${encodeURIComponent(slug)}`,
    { withCredentials: true }
  );
  return res.data;
}
