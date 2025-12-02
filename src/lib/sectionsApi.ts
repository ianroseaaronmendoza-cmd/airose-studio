export async function saveSectionsPage(slug: string, title: string, sections: any[]) {
  const res = await fetch("/dev/sections/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, title, sections }),
  });

  if (!res.ok) throw new Error("Failed to save sections");

  const json = await res.json();
  return json.saved;
}

export async function deleteSectionsPage(slug: string) {
  const res = await fetch("/dev/sections/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) throw new Error("Failed to delete sections");

  return res.json();
}
