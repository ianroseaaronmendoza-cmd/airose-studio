import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackButton from "../../../components/BackButton";
import { useEditor } from "../../../context/EditorContext";
import { API_BASE } from "../../../config";

type Novel = {
  id: number;
  title: string;
  summary: string;
  coverUrl?: string | null;
  updatedAt: string;
  slug: string;
};

export default function NovelsIndexPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  useEffect(() => {
    loadNovels();
  }, []);

  async function loadNovels() {
    try {
      const res = await axios.get(`${API_BASE}/api/novels`);
      setNovels(res.data);
    } catch (err) {
      console.error("Error loading novels:", err);
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm("Are you sure you want to delete this novel?")) return;
    try {
      await axios.delete(`${API_BASE}/api/novels/${slug}`);
      setNovels((prev) => prev.filter((n) => n.slug !== slug));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">
      <div className="mb-6">
        <BackButton to="/writing" />
      </div>

      <h2 className="text-4xl font-bold text-pink-400 mb-2">Novels</h2>
      <p className="text-gray-400 mb-6">
        Read stories and ongoing works published by Airose.
      </p>

      {editorMode && (
        <button
          onClick={() => navigate("/writing/novels/new")}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold py-2 px-5 rounded-xl mb-6 transition"
        >
          + New Novel
        </button>
      )}

      {novels.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center">
          No novels yet. Create your first story!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {novels.map((novel) => (
            <div
              key={novel.id}
              onClick={() =>
                navigate(`/writing/novels/edit/${novel.slug}/chapters`)
              }
              className="relative group bg-[#111] rounded-2xl overflow-hidden shadow-md hover:shadow-pink-500/30 transition transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="aspect-[3/4] bg-gray-800 overflow-hidden">
                {novel.coverUrl ? (
                  <img
                    src={`${API_BASE}${novel.coverUrl}`}
                    alt={novel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 italic">
                    No cover
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-pink-300 truncate">
                  {novel.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                  {novel.summary || "No synopsis yet..."}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Updated {new Date(novel.updatedAt).toLocaleDateString()}
                </p>

                {editorMode && (
                  <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/writing/novels/edit/${novel.slug}`);
                      }}
                      className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/writing/novels/edit/${novel.slug}/chapters`
                        );
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Chapters
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(novel.slug);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
