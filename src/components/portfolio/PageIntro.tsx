import React from "react";
export default function PageIntro({
  eyebrow,
  title,
  children,
}: React.PropsWithChildren<{ eyebrow: string; title: string }>) {
  return (
    <header className="studio-intro">
      <p className="studio-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="studio-lede">{children}</div>
    </header>
  );
}
