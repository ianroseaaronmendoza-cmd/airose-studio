// app/context/EditorContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EditorContextType = {
  isAuthenticated: boolean;
  editorMode: boolean;
  loading: boolean;
  toggleEditor: () => void;
  setAuthenticated: (v: boolean) => void;
  setEditorMode: (v: boolean) => void;
  logout: () => Promise<void>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [editorMode, setEditorModeState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Read persisted editor preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("editor_mode");
      if (stored !== null) setEditorModeState(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  // Check cookie authentication state from server
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/check-editor");
        if (!mounted) return;

        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(Boolean(data.ok));

          // If user authenticated but no editor preference stored, set default ON
          if (data.ok && localStorage.getItem("editor_mode") === null) {
            setEditorModeState(true);
            localStorage.setItem("editor_mode", "true");
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();
    window.addEventListener("focus", checkAuth);

    return () => {
      mounted = false;
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  // Toggle editor display preference
  const toggleEditor = () => {
    const next = !editorMode;
    setEditorModeState(next);
    try {
      localStorage.setItem("editor_mode", next ? "true" : "false");
    } catch {}
  };

  const setEditorMode = (v: boolean) => {
    setEditorModeState(v);
    try {
      localStorage.setItem("editor_mode", v ? "true" : "false");
    } catch {}
  };

  const setAuthenticated = (v: boolean) => {
    setIsAuthenticated(v);
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch("/api/editor-logout", { method: "POST" });
    } catch {
      // ignore
    }

    setIsAuthenticated(false);
    setEditorModeState(false);

    try {
      localStorage.removeItem("editor_mode");
    } catch {}

    router.push("/");
  };

  return (
    <EditorContext.Provider
      value={{
        isAuthenticated,
        editorMode,
        loading,
        toggleEditor,
        setAuthenticated,
        setEditorMode,
        logout,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}



