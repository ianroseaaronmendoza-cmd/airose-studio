import { httpPost, httpGet } from "./http";
import { Result } from "./result";

export interface Section {
  id: string;
  type: string;
  content: any;
}

export interface SectionsPage {
  slug: string;
  title: string;
  sections: Section[];
  updated: number;
}

/* -----------------------------------------
   Load a sections page from /data/...json
----------------------------------------- */
export async function loadSectionsPage(
  slug: string
): Promise<Result<SectionsPage | null>> {
  const res = await httpGet<SectionsPage>(`/data/sections/${slug}.json`);

  if (!res.ok) {
    // Page doesn't exist yet → valid state
    return { ok: true, data: null };
  }

  return res;
}

/* -----------------------------------------
   Save sections page through dev FS
----------------------------------------- */
export async function saveSectionsPage(
  slug: string,
  title: string,
  sections: Section[]
): Promise<Result<SectionsPage>> {
  return httpPost<SectionsPage>("/dev/sections/save", {
    slug,
    title,
    sections,
  });
}

/* -----------------------------------------
   Delete sections page
----------------------------------------- */
export async function deleteSectionsPage(
  slug: string
): Promise<Result<{}>> {
  return httpPost("/dev/sections/delete", { slug });
}
