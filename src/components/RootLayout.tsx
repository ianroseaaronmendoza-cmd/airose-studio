// src/components/RootLayout.tsx
import React, { useState } from "react";
import Header from "./Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <Header
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
      <main className="min-h-screen p-6">{children}</main>
    </div>
  );
}
