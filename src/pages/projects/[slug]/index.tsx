import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { loadProject, Project } from "../../../client/api/projects";
import PageIntro from "../../../components/portfolio/PageIntro";
export default function ProjectViewPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setProject(null);
    if (slug)
      loadProject(slug)
        .then((p) => {
          if (active) setProject(p);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [slug]);
  if (loading)
    return (
      <div className="studio-container studio-empty" role="status">
        Loading project…
      </div>
    );
  if (!project)
    return (
      <div className="studio-container studio-empty">
        <h1>Project not found</h1>
        <Link to="/projects">Back to projects →</Link>
      </div>
    );
  return (
    <div className="studio-container">
      <PageIntro eyebrow="02 / Project journal" title={project.title}>
        <p>{project.description}</p>
        <div className="studio-meta">
          {project.status && (
            <span className="studio-badge">{project.status}</span>
          )}
          {project.category}
        </div>
      </PageIntro>
      <Link className="studio-text-link" to="/projects">
        ← All projects
      </Link>
      {!!project.links?.length && (
        <div className="studio-actions">
          {project.links.map((link) => (
            <a
              key={link.url}
              className="studio-button secondary"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
      {!!project.screenshots?.length && (
        <section className="studio-gallery" aria-label="Project screenshots">
          {project.screenshots.map((shot, i) => (
            <figure key={i}>
              <img src={shot.url} alt={shot.alt} loading="lazy" />
              {shot.alt && <figcaption>{shot.alt}</figcaption>}
            </figure>
          ))}
        </section>
      )}
      <div
        className="studio-rich-content"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(project.content),
        }}
      />
      {!!project.updates?.length && (
        <section className="studio-section">
          <h2>Development updates</h2>
          {[...project.updates]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((update, i) => (
              <article className="studio-update" key={i}>
                <time className="studio-eyebrow" dateTime={update.date}>
                  {update.date}
                </time>
                <h3>{update.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{update.body}</p>
              </article>
            ))}
        </section>
      )}
    </div>
  );
}
