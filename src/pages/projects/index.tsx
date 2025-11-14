// src/pages/projects/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProjectCard from "@/components/ProjectCard";
import { getAllProjects, type Project } from "@/client/api/projects";
import { useEditor } from "@/context/EditorContext";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllProjects();
        setProjects(data);
      } catch (err) {
        console.error("❌ Failed to load projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDeleted = (slug: string) => {
    setProjects((prev) => prev.filter((p) => p.slug !== slug));
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">{error}</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-pink-400 mb-6">Projects</h1>

      {editorMode && (
        <button
          onClick={() => navigate("/projects/new")}
          className="mb-6 px-4 py-2 bg-pink-500 rounded-lg text-white hover:bg-pink-600 transition"
        >
          + New Project
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={() => handleDeleted(project.slug)}
          />
        ))}
      </div>
    </div>
  );
}