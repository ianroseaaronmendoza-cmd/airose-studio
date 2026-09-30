import React from "react";
import { Link } from "react-router-dom";
import PageIntro from "../components/portfolio/PageIntro";
export default function AboutPage() {
  return (
    <div className="studio-container">
      <PageIntro
        eyebrow="05 / About the studio"
        title="One imagination. Many ways to make."
      >
        <p>
          Airose Studio is the creative home of Ian Mendoza—bringing books,
          stories, software, games, music, and writing together.
        </p>
      </PageIntro>
      <section className="studio-section" style={{ borderTop: 0 }}>
        <div className="studio-two-column">
          <div>
            <p className="studio-eyebrow">The person behind the work</p>
            <h2 style={{ fontSize: 42, fontWeight: 400 }}>Hello, I’m Ian.</h2>
            <p>
              I’m a product engineer and a curious creator. Some ideas become
              songs. Some become stories. Others become tools that make a small
              part of life easier.
            </p>
            <p>
              This studio is a place for all of them: finished work, things
              taking shape, and experiments that open a new door.
            </p>
            <Link className="studio-text-link" to="/projects">
              See what I’m making →
            </Link>
          </div>
          <aside className="studio-note">
            <p className="studio-eyebrow">Behind the name</p>
            <h2>A name that stayed.</h2>
            <p>
              “Airose” began with an online friend, who rearranged the letters
              of my name while I was looking for a gaming username. It was
              available. I kept it.
            </p>
            <p>Today, it’s the name that connects the things I create.</p>
          </aside>
        </div>
      </section>
      <section className="studio-section">
        <p className="studio-eyebrow">Where imagination becomes craft.</p>
        <blockquote
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(26px,3vw,40px)",
            maxWidth: 900,
            margin: "0 0 30px",
          }}
        >
          “The creative God created us to be creative. I’m just fulfilling that
          role.”
        </blockquote>
        <p>— Ian Mendoza</p>
        <Link className="studio-text-link" to="/support">
          Support the work →
        </Link>
      </section>
    </div>
  );
}
