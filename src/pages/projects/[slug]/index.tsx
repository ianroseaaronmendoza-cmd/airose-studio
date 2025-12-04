// src/pages/projects/[slug]/index.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "@/components/BackButton";

import { loadProject } from "@/client/api/projects";

export default function ProjectViewPage() {
  const { slug } = useParams();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (!slug) return;
        const data = await loadProject(slug);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <p className="text-gray-400">Loading project...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!project) return <p className="text-gray-400">Project not found</p>;

  return (
    <div className="w-full pt-8 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <div className="flex flex-col items-start gap-12 mb-8">
        <div className="w-full sm:w-72">
          <BackButton label="Back to Projects" to="/projects" />
        </div>

        <h1 className="text-4xl font-bold text-pink-400 mt-2">{project.title}</h1>
      </div>

      {project.description && (
        <p className="text-gray-300 mb-6 text-lg">{project.description}</p>
      )}

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: project.content || "" }}
      />
    </div>
  );
}
