import React from "react";
import { Link } from "react-router-dom";
import PageIntro from "../../components/portfolio/PageIntro";
export default function WritingPage() {
  return (
    <div className="studio-container">
      <PageIntro eyebrow="04 / Writing" title="Room for a thought to unfold.">
        <p>
          Poems, essays, and reflections. Small observations, longer questions,
          and words worth keeping.
        </p>
      </PageIntro>
      <section className="studio-section" style={{ borderTop: 0 }}>
        {[
          [
            "/writing/poems",
            "Poems",
            "A little rhythm, a little honesty. Words that find their own shape.",
          ],
          [
            "/writing/blogs",
            "Blogs & reflections",
            "Thoughts on creating, learning, and living.",
          ],
          [
            "/books",
            "Books & Stories",
            "Published work and free online fiction, gathered on one bookshelf.",
          ],
        ].map(([url, title, description]) => (
          <Link className="studio-writing-link" key={url} to={url}>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
