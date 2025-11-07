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

// ✅ Exported so EditorLoginPage can reuse it
export type LoginResult = { ok: true } | { ok: false; error?: string };

export interface EditorContextType {
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  loading: boolean;
  editorMode: boolean;
  setEditorMode: (v: boolean) => void;
  toggleEditor: () => void;
  login: (password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(() => {
    try {
      const raw = localStorage.getItem("editor_mode_v1");
      return raw ? JSON.parse(raw) === true : false;
    } catch {
      return false;
    }
  });

  const setAuthenticated = (v: boolean) => setIsAuthenticated(v);

  const toggleEditor = () => {
    setEditorMode((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem("editor_mode_v1", JSON.stringify(newValue));
      } catch {}
      return newValue;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem("editor_mode_v1", JSON.stringify(editorMode));
    } catch {}
  }, [editorMode]);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await checkAuth();
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
      setAuthenticated,
      loading,
      editorMode,
      setEditorMode,
      toggleEditor,
      login,
      logout,
      checkAuth,
    }),
    [isAuthenticated, loading, editorMode]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
