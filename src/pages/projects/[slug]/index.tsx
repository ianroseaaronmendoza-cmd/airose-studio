// src/pages/projects/[slug]/index.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";

import { getProject } from "../../../client/api/projects";

export default function ProjectViewPage() {
  const { slug } = useParams();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProject(slug!);
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
    <div className="max-w-4xl mx-auto pt-8 px-4">
      {/* Back button + Title with increased vertical spacing */}
      <div className="flex flex-col items-start gap-12 mb-8">
        {/* constrain width so the button doesn't stretch too far */}
        <div className="w-full sm:w-72">
          <BackButton label="Back to Projects" to="/projects" />
        </div>

        {/* bigger top margin for title area so it's clearly separated */}
        <h1 className="text-4xl font-bold text-pink-400 mt-2">{project.title}</h1>
      </div>

      {project.summary && (
        <p className="text-gray-300 mb-6 text-lg">{project.summary}</p>
      )}

      {/* Project Content */}
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: project.content || "" }}
      />
    </div>
  );
}
