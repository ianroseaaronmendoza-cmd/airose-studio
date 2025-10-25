// app/(auth)/editor-login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/app/context/EditorContext";

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

      // Server set the HttpOnly cookie. Now update client state (no localStorage token).
      setAuthenticated(true);
      setEditorMode(true); // enable editor by default after login

      // go to editor area or refresh UI
      router.push("/editor");
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component (unchanged) ...
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="...">
        {/* form contents unchanged */}
      </form>
    </div>
  );
}