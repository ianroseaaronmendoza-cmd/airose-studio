"use client";

import "./globals.css";
import Link from "next/link";
import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorProvider, useEditor } from "@/app/context/EditorContext";
import { SessionProvider, useSession, signOut } from "next-auth/react";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  return (
    <html lang="en" className="bg-[#0a0a0a]">
      <body className="bg-[#0a0a0a] text-gray-100 scroll-smooth">
        <SessionProvider>
          <EditorProvider>
            <Header
              menuOpen={menuOpen}
              toggleMenu={toggleMenu}
              closeMenu={closeMenu}
            />
            <main className="bg-[#0a0a0a] min-h-screen">{children}</main>

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
          </EditorProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

/* ---------------- Header (admin check + logout) ---------------- */

function Header({
  menuOpen,
  toggleMenu,
  closeMenu,
}: {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}) {
  const { data: session } = useSession();
  const { editorMode, toggleEditor } = useEditor();

  const isAdmin = session?.user?.role === "admin";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808]/95 backdrop-blur z-50">
        <div className="text-lg font-semibold tracking-wide">
          <span className="text-pink-400">Airose Studio</span> by Airose Official
        </div>

        {/* Desktop Nav */}
        <nav className="space-x-6 hidden md:flex items-center">
          <NavLinks closeMenu={closeMenu} />

          {!session && (
            <Link
              href="/signin"
              className="text-sm text-pink-400 hover:text-white transition"
            >
              Sign In
            </Link>
          )}

          {session && (
            <button
              onClick={handleLogout}
              className="text-sm text-pink-400 hover:text-white transition"
            >
              Logout
            </button>
          )}

          {isAdmin && (
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
          )}
        </nav>

        {/* Mobile Nav Button */}
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

        {/* Mobile Menu */}
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

                  {!session && (
                    <Link
                      href="/signin"
                      onClick={closeMenu}
                      className="text-pink-400 hover:text-white transition"
                    >
                      Sign In
                    </Link>
                  )}

                  {session && (
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="text-pink-400 hover:text-white transition"
                    >
                      Logout
                    </button>
                  )}

                  {isAdmin && (
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
                  )}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

/* ---------------- NavLinks ---------------- */

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
