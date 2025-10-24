"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { EditorContext } from "./context/EditorContext"; // ✅ Only import, not redefine

export default function RootLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(false);

  // Load saved editor mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("editorMode");
    if (saved === "true") setEditorMode(true);
  }, []);

  // Save editor mode to localStorage when toggled
  useEffect(() => {
    localStorage.setItem("editorMode", String(editorMode));
  }, [editorMode]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const toggleEditor = () => setEditorMode((prev) => !prev);

  return (
    <html lang="en" className="bg-[#0a0a0a]">
      <body className="bg-[#0a0a0a] text-gray-100 scroll-smooth">
        {/* === Global Editor Context Provider === */}
        <EditorContext.Provider value={{ editorMode, toggleEditor }}>
          {/* === HEADER === */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808]/95 backdrop-blur z-50">
            <div className="text-lg font-semibold tracking-wide">
              <span className="text-pink-400">Airose Studio</span> by Airose Official
            </div>

            {/* Desktop Nav */}
            <nav className="space-x-6 hidden md:flex items-center">
              <NavLinks closeMenu={closeMenu} />
              <button
                onClick={toggleEditor}
                className={`px-3 py-1.5 rounded text-sm font-medium border transition ${
                  editorMode
                    ? "bg-pink-500 text-white border-pink-400"
                    : "border-gray-700 text-gray-400"
                }`}
              >
                {editorMode ? "Editor Mode: ON" : "Editor Mode: OFF"}
              </button>
            </nav>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-neutral-900 text-gray-300"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {/* Mobile Drawer */}
            <AnimatePresence>
              {menuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={closeMenu}
                  />
                  <motion.aside
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    className="fixed top-0 right-0 z-50 h-full w-64 bg-[#0b0b0b] border-l border-gray-800 p-6 shadow-lg flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-pink-400">Menu</div>
                      <button
                        onClick={closeMenu}
                        aria-label="Close menu"
                        className="p-2 rounded-md hover:bg-neutral-900"
                      >
                        ✕
                      </button>
                    </div>

                    <nav className="flex flex-col gap-4 mt-6">
                      <NavLinks closeMenu={closeMenu} isMobile />
                      <button
                        onClick={() => {
                          toggleEditor();
                          closeMenu();
                        }}
                        className={`px-3 py-1.5 rounded text-sm font-medium border transition ${
                          editorMode
                            ? "bg-pink-500 text-white border-pink-400"
                            : "border-gray-700 text-gray-400"
                        }`}
                      >
                        {editorMode ? "Editor Mode: ON" : "Editor Mode: OFF"}
                      </button>
                    </nav>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          </header>

          {/* === MAIN === */}
          <main className="bg-[#0a0a0a] min-h-screen">{children}</main>

          {/* === FOOTER === */}
          <footer className="border-t border-gray-800 py-8 mt-8 text-center bg-[#0a0a0a]">
            <p className="text-sm text-gray-400">
              © 2025 Airose Studio by Airose Official | Soli Deo Gloria
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <a
                href="https://www.instagram.com/airose_official/"
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-white transition"
              >
                Instagram
              </a>
              <a
                href="https://open.spotify.com/artist/7siLh2Wz78DXsMBsS3HRGG?si=a8fc159d713c4648"
                target="_blank"
                rel="noreferrer"
                className="text-[#1DB954] hover:text-white transition"
              >
                Spotify
              </a>
              <a
                href="https://www.youtube.com/@AiroseOfficial"
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-white transition"
              >
                YouTube
              </a>
              <a
                href="https://www.wattpad.com/user/Mazedon"
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-white transition"
              >
                Wattpad
              </a>
            </div>
          </footer>
        </EditorContext.Provider>
      </body>
    </html>
  );
}

/* === Reusable Navigation Links === */
function NavLinks({
  closeMenu,
  isMobile = false,
}: {
  closeMenu: () => void;
  isMobile?: boolean;
}) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/music", label: "Music" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" },
  ];

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={closeMenu}
          className={`${
            isMobile
              ? "text-gray-300 hover:text-pink-400 text-base transition"
              : "text-sm text-gray-300 hover:text-pink-400 transition"
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
