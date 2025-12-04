// src/pages/projects/index.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProjectCard from "@/components/ProjectCard";
import { loadProjects, type Project } from "@/client/api/projects";
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
        const data = await loadProjects();
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

  if (loading) return <div className="text-center text-gray-400 mt-10">Loading projects...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="w-full pb-20 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <h1 className="text-4xl font-bold !text-pink-400 mb-2">Projects</h1>
      <p className="text-gray-400 mb-6">
        Explore creative works and ongoing developments from Airose Studio.
      </p>

      {editorMode && (
        <button
          onClick={() => navigate("/projects/new")}
          className="mb-6 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 rounded-lg text-white font-semibold transition"
        >
          + New Project
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onDelete={() => handleDeleted(project.slug)}
          />
        ))}
      </div>
    </div>
  );
}
