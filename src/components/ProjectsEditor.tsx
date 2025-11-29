// src/pages/projects/edit/[slug]/index.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { loadProject } from "@/client/api/projects";
import ProjectsEditor from "@/components/ProjectsEditor";

export default function EditProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!slug) return;
        const data = await loadProject(slug);
        setProject(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <p className="text-gray-400">Loading…</p>;
  if (!project) return <p className="text-red-400">Project not found.</p>;

  return (
    <div className="max-w-5xl mx-auto py-10">
      <ProjectsEditor
        initial={project}
        onSaved={(p) => navigate(`/projects/${p.slug}`)}
      />
    </div>
  );
}
