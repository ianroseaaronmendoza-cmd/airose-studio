// app/editor/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@\/app\/context\/EditorContext";

export default function EditorPage() {
  const router = useRouter();
  const { isAuthenticated, loading, editorMode, toggleEditor, logout } = useEditor();

  // Redirect to login if not authenticated (after initial check)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/editor-login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Authenticated dashboard view
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Welcome to the Editor Dashboard</h1>
      <p className="text-gray-400">
        Editor Mode:{" "}
        <span className="font-semibold text-blue-400">
          {editorMode ? "Enabled" : "Disabled"}
        </span>
      </p>

      <div className="flex gap-4">
        <button
          onClick={toggleEditor}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
        >
          Toggle Editor Mode
        </button>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

