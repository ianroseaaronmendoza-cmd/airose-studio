import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * JSON-ONLY MODE (NO BACKEND)
 * - Production → editor disabled
 * - Development → editor enabled
 */

interface EditorContextType {
  isAuthenticated: boolean;
  editorMode: boolean;
  toggleEditor: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be inside provider");
  return ctx;
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // React Router / Webpack environment flag
  const isProd = import.meta.env?.PROD ?? false;

  const [editorMode, setEditorMode] = useState(() => {
    if (isProd) return false;
    try {
      return JSON.parse(localStorage.getItem("editor_mode_v1") || "false");
    } catch {
      return false;
    }
  });

  const toggleEditor = () => {
    if (isProd) return;
    const next = !editorMode;
    setEditorMode(next);
    localStorage.setItem("editor_mode_v1", JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !isProd,
      editorMode,
      toggleEditor,
    }),
    [isProd, editorMode]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
