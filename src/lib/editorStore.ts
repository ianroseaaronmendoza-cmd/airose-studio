// src/lib/editorStore.ts
// Minimal, dependency-free editor store

import { saveFile, loadFile } from "./localPersistence";

export type Section = {
  id: string;
  type: string; // "text", "image", "quote", etc
  payload: any;
};

export type PageData = {
  id?: string;
  title?: string;
  sections: Section[];
  meta?: Record<string, any>;
  version?: string;
};

type Listener = (s: PageData) => void;

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function createEditorStore(pagePath: string) {
  let state: PageData = { sections: [] };
  const listeners: Listener[] = [];
  const path = pagePath;

  async function init() {
    const loaded = await loadFile(path);
    if (loaded) {
      state = loaded;
    } else {
      state = { sections: [], title: "Untitled" };
    }
    emit();
  }

  function emit() {
    listeners.forEach((l) => l(state));
  }

  function subscribe(fn: Listener) {
    listeners.push(fn);
    fn(state);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function get() {
    return structuredClone(state);
  }

  function set(newState: PageData) {
    state = structuredClone(newState);
    emit();
  }

  function addSection(section: Partial<Section> = {}, index?: number) {
    const s: Section = {
      id: section.id || uid("sec_"),
      type: section.type || "text",
      payload: section.payload ?? { text: "" },
    };
    if (typeof index === "number") state.sections.splice(index, 0, s);
    else state.sections.push(s);
    emit();
  }

  function updateSection(id: string, patch: Partial<Section>) {
    const i = state.sections.findIndex((x) => x.id === id);
    if (i < 0) return;
    state.sections[i] = { ...state.sections[i], ...patch };
    emit();
  }

  function deleteSection(id: string) {
    state.sections = state.sections.filter((s) => s.id !== id);
    emit();
  }

  function reorderSections(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const arr = state.sections;
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    emit();
  }

  async function saveLocally(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await saveFile(path, state);
      return res;
    } catch (err: any) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  async function reloadFromDisk() {
    const loaded = await loadFile(path);
    if (loaded) {
      state = loaded;
      emit();
    }
  }

  // Expose API
  return {
    init,
    subscribe,
    get,
    set,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    saveLocally,
    reloadFromDisk,
    path,
  };
}
