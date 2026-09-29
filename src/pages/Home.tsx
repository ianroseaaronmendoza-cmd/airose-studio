import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import books from "../../public/data/books.json";
import BookCard from "../components/portfolio/BookCard";
import ProjectCard from "../components/ProjectCard";
import { loadProjects, Project } from "../client/api/projects";
export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    let active = true;
    loadProjects()
      .then((items) => {
        if (active) setProjects(items.filter((p) => p.featured).slice(0, 2));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="studio-container">
      <section className="studio-hero">
        <div>
          <p className="studio-eyebrow">Books. Code. Music. Possibility.</p>
          <h1>
            Where imagination
            <br />
            becomes <em>craft.</em>
          </h1>
          <p className="studio-hero-copy">
            The creative home of Ian Mendoza. Stories to get lost in, tools to
            make things with, and music to carry with you.
          </p>
          <div className="studio-actions">
            <Link className="studio-button" to="/books">
              Explore Books & Stories ↗
            </Link>
            <Link className="studio-button secondary" to="/projects">
              Discover the projects →
            </Link>
          </div>
        </div>
        <div className="studio-hero-art" aria-hidden="true">
          <span className="studio-art-star">✳</span>
          <span className="studio-art-caption">Ideas take shape here</span>
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow">01 / From the bookshelf</p>
            <h2>Words made to stay.</h2>
          </div>
          <Link className="studio-text-link" to="/books">
            All books & stories →
          </Link>
        </div>
        {books
          .filter((b) => b.featured)
          .map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
      </section>
      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow">02 / From the workbench</p>
            <h2>Curiosity, put to work.</h2>
          </div>
          <Link className="studio-text-link" to="/projects">
            Explore projects →
          </Link>
        </div>
        {projects.length ? (
          <div className="studio-project-grid">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : (
          <p>
            Tools, experiments, and ideas in progress.{" "}
            <Link to="/projects">Visit the project collection →</Link>
          </p>
        )}
      </section>
      <section className="studio-section">
        <div className="studio-two-column">
          <div>
            <p className="studio-eyebrow">03 / Press play</p>
            <h2 style={{ fontSize: "clamp(34px,4vw,54px)", fontWeight: 400 }}>
              A different kind
              <br />
              of storytelling.
            </h2>
            <p>
              Original music by Airose Official. Songs of faith, reflection, and
              the things words alone can’t quite hold.
            </p>
            <Link className="studio-text-link" to="/music">
              Listen to the music →
            </Link>
          </div>
          <iframe
            className="studio-music-embed"
            title="Airose’s Compositions on Spotify"
            src="https://open.spotify.com/embed/playlist/2zNmUwTinrldAjDzQA7Obo?utm_source=generator"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>
      </section>
      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow">04 / Notes & reflections</p>
            <h2>There’s more on the page.</h2>
          </div>
          <Link className="studio-text-link" to="/writing">
            Explore the writing →
          </Link>
        </div>
        <p>Poems, thoughts, and reflections from a life spent making things.</p>
      </section>
    </div>
  );
}
