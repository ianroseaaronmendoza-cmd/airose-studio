// src/pages/EditorLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../context/EditorContext";

/// <reference types="react" />
export default function EditorLoginPage() {
  const navigate = useNavigate();
  const { login } = useEditor();

  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(password);
      if (!result.ok) {
        setError(result.error || "Login failed");
      } else {
        navigate("/editor", { replace: true });
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-gray-100">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0f0f0f] shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-6">Editor Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
            className="w-full px-4 py-2 mb-4 rounded-lg bg-neutral-900 text-white border border-gray-800 focus:outline-none"
            required
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium transition ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-teal-400"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
