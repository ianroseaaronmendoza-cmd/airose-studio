import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check login state from backend
    const verifyLogin = async () => {
      try {
        const res = await fetch("/api/check-editor", {
          method: "GET",
          credentials: "include", // send the cookie
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAuthorized(true);
          } else {
            navigate("/editor-login");
          }
        } else {
          navigate("/editor-login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/editor-login");
      } finally {
        setLoading(false);
      }
    };

    verifyLogin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-400">
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!authorized) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/editor-logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/editor-login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
      <div className="bg-neutral-900/80 p-8 rounded-2xl shadow-xl w-[420px] text-center">
        <h2 className="text-3xl font-bold mb-3 text-pink-400">Airose Studio</h2>
        <p className="text-gray-400 mb-6">
          Welcome, <span className="text-white font-semibold">Editor</span>!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-pink-500 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            Back to Site
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
