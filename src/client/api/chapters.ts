import axios from "axios";

/* ---------------------------------------------------------
   SMART BASE URL (DEV + Render)
--------------------------------------------------------- */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://airose-studio.onrender.com/api"
    : "http://localhost:4000/api";

/* ---------------------------------------------------------
   CHAPTER API FUNCTIONS
--------------------------------------------------------- */
export async function getChapters(novelSlug: string) {
  const res = await axios.get(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters`,
    { withCredentials: true }
  );
  return res.data;
}

export async function getChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.get(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
    { withCredentials: true }
  );
  return res.data;
}

export async function createChapter(
  novelSlug: string,
  payload: { title?: string; slug?: string; body?: string }
) {
  const res = await axios.post(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function updateChapter(
  novelSlug: string,
  chapterSlug: string | number,
  payload: Partial<{ title: string; body: string; slug?: string }>
) {
  const res = await axios.put(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(
      String(chapterSlug)
    )}`,
    payload,
    { withCredentials: true }
  );
  return res.data;
}

export async function deleteChapter(novelSlug: string, chapterSlug: string) {
  const res = await axios.delete(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
    { withCredentials: true }
  );
  return res.data;
}

export async function reorderChapters(novelSlug: string, order: string[]) {
  const res = await axios.patch(
    `${BASE_URL}/novels/${encodeURIComponent(novelSlug)}/chapters/reorder`,
    { order },
    { withCredentials: true }
  );
  return res.data;
}
