"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditorLoginPage() {
  const router = useRouter();
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

      // No need to store token in localStorage anymore

      // Redirect to protected page after login
      router.push("/editor"); // or your protected route
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-semibold text-center mb-6">
          Enter Editor Password
        </h1>

        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 focus:ring-2 focus:ring-pink-400 outline-none"
        />

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm rounded p-2 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Unlocking..." : "Unlock Editor"}
        </button>
      </form>
    </div>
  );
}