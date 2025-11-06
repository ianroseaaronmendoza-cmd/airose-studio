// src/context/EditorContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * EditorContext
 * - isAuthenticated: whether server recognizes editor cookie
 * - loading: initial check in progress
 * - editorMode: UI toggle for editor controls (client-side)
 * - login(password): performs POST /api/editor-login, verifies cookie via /api/check-editor
 * - logout(): POST /api/editor-logout and clear local state
 *
 * Notes:
 * - All fetches use credentials: 'include' (cookies required)
 * - This file is safe for production if server cookie settings are configured correctly
 */

type LoginResult = { ok: true } | { ok: false; error: string };

type EditorContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  editorMode: boolean;
  setEditorMode: (v: boolean) => void;
  toggleEditor: () => void; // ✅ added for header toggle
  login: (password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [editorMode, setEditorMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("editor_mode_v1");
      return raw ? JSON.parse(raw) === true : false;
    } catch {
      return false;
    }
  });

  // ✅ Added toggleEditor handler (persistent)
  const toggleEditor = () => {
    setEditorMode((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem("editor_mode_v1", JSON.stringify(newValue));
      } catch {}
      return newValue;
    });
  };

  // persist editor mode in localStorage (so toggling survives refresh)
  useEffect(() => {
    try {
      localStorage.setItem("editor_mode_v1", JSON.stringify(editorMode));
    } catch {}
  }, [editorMode]);

  // checkAuth: call backend to see if editor cookie is valid
  const checkAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/check-editor", {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setIsAuthenticated(false);
        return false;
      }
      const json = await res.json();
      const ok = Boolean(json?.authenticated);
      setIsAuthenticated(ok);
      return ok;
    } catch (err) {
      console.warn("checkAuth failed", err);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // run initial check on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await checkAuth();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login: post password, then re-check via /api/check-editor to confirm cookie is present
  const login = async (password: string): Promise<LoginResult> => {
    if (!password || typeof password !== "string") {
      return { ok: false, error: "Missing password" };
    }
    try {
      const res = await fetch("/api/editor-login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        let json = null;
        try {
          json = await res.json();
        } catch {}
        const errMsg = json?.error || `Login failed (status ${res.status})`;
        return { ok: false, error: errMsg };
      }

      await new Promise((r) => setTimeout(r, 120));
      const ok = await checkAuth();
      if (!ok) {
        return {
          ok: false,
          error:
            "Login succeeded but cookie was not recognized. Check CORS/cookie settings.",
        };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("login exception", err);
      return { ok: false, error: err?.message || "Login error" };
    }
  };

  // logout: ask backend to clear cookie, then clear client state
  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/editor-logout", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch (err) {
      console.warn("logout request failed", err);
    } finally {
      setIsAuthenticated(false);
      setEditorMode(false);
      try {
        localStorage.removeItem("editor_mode_v1");
      } catch {}
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      loading,
      editorMode,
      setEditorMode,
      toggleEditor, // ✅ added here
      login,
      logout,
      checkAuth,
    }),
    [isAuthenticated, loading, editorMode]
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
