// src/utils/uploadImage.ts
export async function uploadImage(
  file: File,
  section: "blogs" | "projects" | "novels" | "music" | "chapters" | "poems"
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("section", section);

  const res = await fetch("/dev/upload", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error("Upload failed");

  const json = await res.json();
  if (!json.ok || !json.url) throw new Error("Invalid upload response");

  return json.url; // example: "/uploads/chapters/1699300000123-image.jpg"
}
