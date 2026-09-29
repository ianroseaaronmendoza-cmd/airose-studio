import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEditor } from "../../context/EditorContext";
import { isDev } from "../../lib/env";
import "../../styles/portfolio.css";

const links = [
  ["/", "Home"],
  ["/books", "Books & Stories"],
  ["/projects", "Projects"],
  ["/music", "Music"],
  ["/writing", "Writing"],
  ["/about", "About"],
];

export default function PortfolioLayout({ children }: React.PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggle = useRef<HTMLButtonElement>(null);
  const { editorMode, toggleEditor } = useEditor();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div
      className="portfolio"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a href="#portfolio-main" className="studio-skip">
        Skip to content
      </a>
      <header className="studio-header">
        <Link to="/" className="studio-brand" aria-label="Airose Studio home">
          <span className="studio-mark" aria-hidden="true">
            a.
          </span>
          <span>
            AIROSE
            <span className="studio-brand-sub">
              INDEPENDENT CREATIVE STUDIO
            </span>
          </span>
        </Link>
        <button
          ref={toggle}
          className="studio-menu"
          aria-expanded={open}
          aria-controls="studio-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close menu" : "Menu"}
        </button>
        <nav
          id="studio-navigation"
          aria-label="Main navigation"
          className={open ? "studio-nav is-open" : "studio-nav"}
        >
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
          {isDev && (
            <button onClick={toggleEditor}>
              Editor {editorMode ? "on" : "off"}
            </button>
          )}
        </nav>
      </header>
      <main id="portfolio-main" tabIndex={-1}>
        {children}
      </main>
      <footer className="studio-footer">
        <div>
          <Link to="/" className="studio-footer-brand">
            Airose Studio<span aria-hidden="true">✳</span>
          </Link>
          <p>Where imagination becomes craft.</p>
        </div>
        <div className="studio-footer-links">
          <Link to="/support">Support the work</Link>
          <a
            href="https://www.wattpad.com/user/Mazedon"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wattpad ↗
          </a>
          <a
            href="https://www.youtube.com/@AiroseOfficial"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube ↗
          </a>
          <a
            href="https://www.facebook.com/airoseofficial/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook ↗
          </a>
        </div>
        <div className="studio-colophon">
          <span>© {new Date().getFullYear()} Airose Official</span>
          <span>Soli Deo Gloria</span>
        </div>
      </footer>
    </div>
  );
}
