// src/client/api/projects.ts

export interface Project {
  slug: string;
  title: string;
  description: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const isDev =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.MODE === "development") ||
  process.env.NODE_ENV === "development";

/** Load all projects */
export async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch("/data/projects/index.json", { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Project[];
  } catch (err) {
    console.error("loadProjects failed:", err);
    return [];
  }
}

/** Load one project */
export async function loadProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`/data/projects/${slug}.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Project;
  } catch (err) {
    console.error("loadProject failed:", err);
    return null;
  }
}

/** Create new project (DEV only) - alias for saveProject */
export async function createProject(project: Partial<Project>): Promise<Project> {
  if (!isDev) throw new Error("createProject is allowed only in development.");

  const res = await fetch("/dev/project/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to create project");
  }

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Unknown error");

  return json.saved as Project;
}

/** Update existing project (DEV only) - alias for saveProject */
export async function updateProject(project: Project): Promise<Project> {
  if (!isDev) throw new Error("updateProject is allowed only in development.");

  const res = await fetch("/dev/project/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to update project");
  }

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Unknown error");

  return json.saved as Project;
}

/** Save project (DEV only) */
export async function saveProject(project: Project): Promise<Project> {
  if (!isDev) throw new Error("saveProject is allowed only in development.");

  const res = await fetch("/dev/project/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to save project");
  }

  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Unknown error");

  return json.saved as Project;
}

/** Delete project (DEV only) */
export async function deleteProject(slug: string): Promise<void> {
  if (!isDev) throw new Error("deleteProject is dev-only.");

  const res = await fetch("/dev/project/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to delete project");
  }
}
