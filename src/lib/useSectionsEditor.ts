import { useEffect, useState } from "react";
import { saveSectionsPage } from "./sectionsApi";

export interface Section {
  id: string;
  type: string;
  content: any;
}

export function useSectionsEditor(slug: string) {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/data/sections/${slug}.json`);
        if (res.ok) {
          const page = await res.json();
          setTitle(page.title || "");
          setSections(page.sections || []);
        } else {
          console.log("No existing file — starting empty.");
          setSections([]);
        }
      } catch {
        console.log("Could not load page — starting empty.");
        setSections([]);
      }

      setLoading(false);
    }

    load();
  }, [slug]);

  function addSection(type: string) {
    setSections((prev) => [
      ...prev,
      {
        id: "sec_" + Math.random().toString(36).slice(2),
        type,
        content: type === "text" ? "" : {},
      },
    ]);
  }

  function updateSection(id: string, data: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  }

  function deleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function reorderSections(from: number, to: number) {
    setSections((prev) => {
      const arr = [...prev];
      const item = arr.splice(from, 1)[0];
      arr.splice(to, 0, item);
      return arr;
    });
  }

  async function save() {
    setSaving(true);
    await saveSectionsPage(slug, title, sections);
    setSaving(false);
  }

  return {
    title,
    setTitle,
    sections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    save,
    loading,
    saving,
  };
}
