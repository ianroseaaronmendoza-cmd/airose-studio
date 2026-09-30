export const PROJECT_STATUSES = [
  "Released",
  "In Development",
  "Prototype",
  "Experiment",
  "Archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export interface Project {
  slug: string;
  title: string;
  description: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status?: ProjectStatus;
  category?: string;
  cover?: string;
  featured?: boolean;
  screenshots?: { url: string; alt: string }[];
  links?: { label: string; url: string }[];
  updates?: { date: string; title: string; body: string }[];
}
export function normalizeProject(
  raw: Partial<Project> & { summary?: string },
): Project {
  return {
    ...raw,
    slug: raw.slug || "",
    title: raw.title || "",
    description: raw.description ?? raw.summary ?? "",
    content: raw.content || "",
    createdAt: raw.createdAt || 0,
    updatedAt: raw.updatedAt || raw.createdAt || 0,
  };
}
