import { useEffect, useState } from "react";
import {
  loadSectionsPage,
  saveSectionsPage,
  Section,
  SectionsPage,
} from "../persistence/sections";

export function useSectionsEditor(slug: string) {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await loadSectionsPage(slug);

      if (res.ok && res.data) {
        setTitle(res.data.title);
        setSections(res.data.sections);
      } else {
        // create empty page
        setTitle("");
        setSections([]);
      }

      setLoading(false);
    })();
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

  function updateSection(id: string, patch: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
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
    const res = await saveSectionsPage(slug, title, sections);
    setSaving(false);
    return res;
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
