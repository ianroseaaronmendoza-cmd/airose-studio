"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type EditorContextType = {
  editorMode: boolean;
  toggleEditor: () => void;
  setEditorMode: (value: boolean) => void;
};

const EditorContext = createContext<EditorContextType>({
  editorMode: false,
  toggleEditor: () => {},
  setEditorMode: () => {},
});

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [editorMode, setEditorMode] = useState(false);

  // ✅ Toggle editor mode manually
  const toggleEditor = () => {
    setEditorMode((prev) => {
      const newValue = !prev;
      if (!newValue) localStorage.removeItem("editor_token");
      return newValue;
    });
  };

  // ✅ Check token validity on first load
  useEffect(() => {
    const token = localStorage.getItem("editor_token");
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/check-editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (data.valid) {
          setEditorMode(true);
        } else {
          localStorage.removeItem("editor_token");
          setEditorMode(false);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("editor_token");
        setEditorMode(false);
      }
    };

    verifyToken();
  }, []);

  return (
    <EditorContext.Provider value={{ editorMode, toggleEditor, setEditorMode }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
