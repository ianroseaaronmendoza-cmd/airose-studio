import React from "react";
import { Link } from "react-router-dom";
import { deleteProject, Project } from "../client/api/projects";
import { useEditor } from "../context/EditorContext";
export default function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete?: () => void;
}) {
  const { editorMode } = useEditor();
  async function remove() {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(project.slug);
      onDelete?.();
    } catch {
      alert("Failed to delete project.");
    }
  }
  return (
    <article className="studio-project-card">
      {project.cover ? (
        <img
          className="studio-project-image"
          src={project.cover}
          alt={project.title}
          loading="lazy"
        />
      ) : (
        <div className="studio-project-placeholder" aria-hidden="true">
          ↗
        </div>
      )}
      <div className="studio-project-copy">
        <div className="studio-meta">
          {project.status && (
            <span className="studio-badge">{project.status}</span>
          )}
          {project.category && <span>{project.category}</span>}
        </div>
        <h2>
          <Link to={`/projects/${project.slug}`}>{project.title} ↗</Link>
        </h2>
        <p>{project.description}</p>
        {project.updatedAt > 0 && (
          <p className="studio-meta">
            Updated{" "}
            {new Date(project.updatedAt).toLocaleDateString("en", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
        {editorMode && (
          <div className="studio-actions">
            <Link
              className="studio-button secondary"
              to={`/projects/${project.slug}/edit`}
            >
              Edit
            </Link>
            <button onClick={remove}>Delete</button>
          </div>
        )}
      </div>
    </article>
  );
}
