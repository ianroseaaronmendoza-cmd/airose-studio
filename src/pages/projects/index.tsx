import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard";
import PageIntro from "../../components/portfolio/PageIntro";
import {
  loadProjects,
  Project,
  PROJECT_STATUSES,
} from "../../client/api/projects";
import { useEditor } from "../../context/EditorContext";
export default function ProjectsPage() {
  const { editorMode } = useEditor();
  const [projects, setProjects] = useState<Project[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [status, setStatus] = useState("All"),
    [category, setCategory] = useState("All");
  useEffect(() => {
    let active = true;
    loadProjects()
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean)),
  ) as string[];
  const visible = projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      (category === "All" || p.category === category),
  );
  return (
    <div className="studio-container">
      <PageIntro eyebrow="02 / Projects" title="Ideas you can explore.">
        <p>
          Software, games, tools, and experiments. Follow a project from its
          first spark to what comes next.
        </p>
      </PageIntro>
      {editorMode && (
        <Link className="studio-button" to="/projects/new">
          New project +
        </Link>
      )}
      <div className="studio-filter">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status" className="studio-empty">
          Loading projects…
        </p>
      ) : error ? (
        <p role="alert" className="studio-empty">
          Projects could not load. Please refresh to try again.
        </p>
      ) : (
        <>
          <p aria-live="polite" className="studio-meta">
            {visible.length} {visible.length === 1 ? "project" : "projects"}
          </p>
          <div className="studio-project-grid">
            {visible.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                onDelete={() =>
                  setProjects((items) =>
                    items.filter((p) => p.slug !== project.slug),
                  )
                }
              />
            ))}
          </div>
          {!visible.length && (
            <p className="studio-empty">No projects match these filters.</p>
          )}
        </>
      )}
    </div>
  );
}
