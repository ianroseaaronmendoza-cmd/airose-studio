// src/context/EditorContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { isDev } from "@/lib/env";

type EditorContextType = {
  editorMode: boolean;
  toggleEditor: () => void;
};

const EditorContext = createContext<EditorContextType>({
  editorMode: false,
  toggleEditor: () => {},
});

export const useEditor = () => useContext(EditorContext);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load saved mode only in DEV
  const initial = (() => {
    if (!isDev) return false;

    try {
      const stored =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("editorMode")
          : null;
      return stored === "true";
    } catch {
      return false;
    }
  })();

  const [editorMode, setEditorMode] = useState<boolean>(initial);

  const toggleEditor = () => {
    if (!isDev) return; // PRODUCTION: block toggling
    setEditorMode((prev) => {
      const updated = !prev;

      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("editorMode", updated ? "true" : "false");
        }
      } catch {}

      return updated;
    });
  };

  // Sync storage in dev mode only
  useEffect(() => {
    if (!isDev) return;
    try {
      localStorage.setItem("editorMode", editorMode ? "true" : "false");
    } catch {}
  }, [editorMode]);

  return (
    <EditorContext.Provider value={{ editorMode, toggleEditor }}>
      {children}
    </EditorContext.Provider>
  );
};
