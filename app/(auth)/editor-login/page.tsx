// app/(auth)/editor-login/page.tsx
"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@\/app\/context\/EditorContext";

export default function EditorLoginPage() {
  const router = useRouter();
  const { setAuthenticated, setEditorMode } = useEditor();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/editor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid password");
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      setEditorMode(true);
      router.push("/editor");
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="p-8 rounded-xl border border-white/10 bg-white/5 shadow-md backdrop-blur-sm space-y-4 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center">Editor Login</h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter editor password"
          className="w-full px-4 py-2 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:border-violet-400"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-gradient-to-r from-violet-600 to-teal-500 hover:opacity-90 transition font-medium"
        >
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </div>
  );
}



