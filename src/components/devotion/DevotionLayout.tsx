// Deliberately frozen visual shell. Do not share portfolio components here.
import React, { useState } from "react";
import Header from "./DevotionHeader";
import Footer from "./DevotionFooter";
export default function DevotionLayout({children}: React.PropsWithChildren) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 isolate relative z-0">
    <Header menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} closeMenu={() => setMenuOpen(false)} />
    {menuOpen && <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md transition-all"></div>}
    <main className="flex-1 pb-28">{children}</main><Footer />
  </div>;
}
