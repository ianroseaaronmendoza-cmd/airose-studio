// src/pages/projects/edit/[slug]/index.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadProject } from "../../../../client/api/projects";
import ProjectsEditor from "../../../../components/ProjectsEditor";
import type { Project } from "../../../../client/api/projects";

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      navigate("/projects");
      return;
    }

    const load = async () => {
      try {
        const data = await loadProject(slug);
        if (!data) {
          alert("Project not found");
          navigate("/projects");
          return;
        }
        setProject(data);
      } catch (err) {
        console.error("Failed to load project:", err);
        alert("Failed to load project");
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <ProjectsEditor
        mode="edit"
        slug={project.slug}
        initialData={{
          title: project.title,
          summary: project.description,
          content: project.content || "",
        }}
      />
    </div>
  );
}
