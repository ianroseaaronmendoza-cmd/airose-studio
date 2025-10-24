"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808]/95 backdrop-blur z-50">
      <div className="text-lg font-semibold tracking-wide">
        <span className="text-pink-400">Airose Studio</span> by Airose Official
      </div>

      {/* Desktop Nav */}
      <nav className="space-x-6 hidden md:flex">
        <NavLinks closeMenu={closeMenu} />
      </nav>

      {/* Mobile Toggle */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-neutral-900 text-gray-300"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
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
                <button onClick={closeMenu} aria-label="Close menu">
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-4 mt-6">
                <NavLinks closeMenu={closeMenu} isMobile />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLinks({ closeMenu, isMobile = false }: { closeMenu: () => void; isMobile?: boolean }) {
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
