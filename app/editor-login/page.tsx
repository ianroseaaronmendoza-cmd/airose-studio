"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditorLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/editor-login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Enter Editor Password</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full p-3 mb-4 rounded bg-zinc-800 border border-zinc-700 focus:ring-2 focus:ring-pink-400"
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded transition"
        >
          Unlock Editor
        </button>
      </form>
    </div>
  );
}
