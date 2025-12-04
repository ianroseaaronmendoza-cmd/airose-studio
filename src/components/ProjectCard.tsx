import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteProject } from "@/client/api/projects";
import { useEditor } from "@/context/EditorContext";

import type { Project } from "@/client/api/projects";

export default function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete?: () => void;
}) {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(project.slug);
      onDelete?.();
    } catch {
      alert("Failed to delete project.");
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.slug}`)}
      className="bg-[#1b1b1b]
        rounded-2xl
        p-6
        border border-[#2d2d2d]
        shadow-lg
        mb-6
        transition-all duration-200
        hover:border-pink-500
        hover:shadow-[0_10px_30px_rgba(219,39,119,0.08)]
        cursor-pointer
     "
    >
      <div className="flex justify-between items-start">
        <div>
          {/* TITLE */}
          <Link
            to={`/projects/${project.slug}`}
            className="text-xl font-semibold text-pink-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {project.title}
          </Link>

          {/* DESCRIPTION (use fallback because old card used summary) */}
          {project.description && (
            <p className="text-gray-300 mt-1">{project.description}</p>
          )}

          <div className="text-gray-500 text-sm mt-3">
            Updated:{" "}
            {project.updatedAt
              ? new Date(project.updatedAt).toLocaleDateString()
              : "-"}
          </div>
        </div>

        {/* EDIT + DELETE — ONLY WHEN IN EDITOR MODE */}
        {editorMode && (
          <div
            className="flex gap-3 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => navigate(`/projects/${project.slug}/edit`)}
              className="px-3 py-1 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
