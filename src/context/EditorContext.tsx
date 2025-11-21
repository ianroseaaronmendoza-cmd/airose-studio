// src/context/EditorContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { RUNTIME_ALLOW_EDITOR } from "../lib/config";

/**
 * EditorContext
 *
 * - `editorMode` is ON only when running on localhost (dev).
 * - `isAuthenticated` is kept simple (you can replace with your auth).
 * - The context reads/writes a localStorage flag so the editor toggle
 *   can persist during a dev session on localhost.
 */

type EditorContextType = {
  editorMode: boolean;
  setEditorMode: (v: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
};

const EditorContext = createContext<EditorContextType>({
  editorMode: false,
  setEditorMode: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const useEditor = () => useContext(EditorContext);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // default editor mode: only true when runtime allows editor (localhost)
  // and localStorage flag is set to "true". This ensures Vercel/prod never turns it on.
  const initialEditorMode = (() => {
    try {
      if (!RUNTIME_ALLOW_EDITOR) return false;
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("editorMode") : null;
      return stored === "true";
    } catch (err) {
      return false;
    }
  })();

  const [editorMode, setEditorModeState] = useState<boolean>(initialEditorMode);

  const setEditorMode = (v: boolean) => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("editorMode", v ? "true" : "false");
      }
    } catch (e) {
      /* ignore */
    }
    setEditorModeState(v);
  };

  // Example: if you want to auto-enable editor in dev without clicking,
  // do not set localStorage. We intentionally DO NOT auto-enable.
  useEffect(() => {
    // keep the editorMode in localStorage up-to-date (defensive)
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("editorMode", editorMode ? "true" : "false");
      }
    } catch (err) {}
  }, [editorMode]);

  return (
    <EditorContext.Provider
      value={{ editorMode, setEditorMode, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </EditorContext.Provider>
  );
};
