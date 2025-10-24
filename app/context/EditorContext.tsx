"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type EditorContextType = {
  editorMode: boolean;
  toggleEditor: () => void;
  setEditorMode?: (v: boolean) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorMode, setEditorMode] = useState<boolean>(false);

  // load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("editorMode") : null;
      if (saved === "true") setEditorMode(true);
    } catch (e) {
      // ignore storage errors in SSR/dev
      console.warn("Failed to read editorMode from localStorage", e);
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("editorMode", String(editorMode));
    } catch (e) {
      console.warn("Failed to write editorMode to localStorage", e);
    }
  }, [editorMode]);

  const toggleEditor = () => setEditorMode((v) => !v);

  return (
    <EditorContext.Provider value={{ editorMode, toggleEditor, setEditorMode }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    // helpful error in dev if provider missing
    throw new Error("useEditor() must be used within an <EditorProvider />");
  }
  return ctx;
}