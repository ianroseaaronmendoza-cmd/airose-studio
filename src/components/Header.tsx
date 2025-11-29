import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import { motion, AnimatePresence } from "framer-motion";
import { isDev } from "@/lib/env";

export default function Header() {
  const { editorMode, toggleEditor } = useEditor();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808]/95 backdrop-blur z-50">
      {/* Brand */}
      <div className="text-lg font-semibold tracking-wide select-none">
        <span className="text-pink-400">Airose Studio</span> by Airose Official
      </div>

      {/* Desktop Navigation */}
      <nav className="space-x-6 hidden md:flex items-center">
        <Link to="/" className="hover:text-pink-400 transition">Home</Link>
        <Link to="/music" className="hover:text-pink-400 transition">Music</Link>
        <Link to="/projects" className="hover:text-pink-400 transition">Projects</Link>
        <Link to="/writing" className="hover:text-pink-400 transition">Writing</Link>
        <Link to="/about" className="hover:text-pink-400 transition">About</Link>
        <Link to="/support" className="hover:text-pink-400 transition">Support</Link>

        {/* DEV-ONLY EDITOR TOGGLE */}
        {isDev && (
          <button
            onClick={toggleEditor}
            className={`px-3 py-1.5 rounded text-sm font-medium border transition ${
              editorMode
                ? "bg-pink-500 text-white border-pink-400"
                : "border-gray-700 text-gray-400"
            }`}
          >
            Editor Mode: {editorMode ? "ON" : "OFF"}
          </button>
        )}
      </nav>

      {/* Mobile Button */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-neutral-900 text-gray-300"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
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
                className="p-2 rounded-md hover:bg-neutral-900"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-4 mt-6">
              <Link to="/" onClick={closeMenu}>Home</Link>
              <Link to="/music" onClick={closeMenu}>Music</Link>
              <Link to="/projects" onClick={closeMenu}>Projects</Link>
              <Link to="/writing" onClick={closeMenu}>Writing</Link>
              <Link to="/about" onClick={closeMenu}>About</Link>
              <Link to="/support" onClick={closeMenu}>Support</Link>

              {/* DEV-ONLY EDITOR TOGGLE */}
              {isDev && (
                <button
                  onClick={() => {
                    toggleEditor();
                    closeMenu();
                  }}
                  className={`mt-2 px-3 py-1.5 rounded text-sm font-medium border transition ${
                    editorMode
                      ? "bg-pink-500 text-white border-pink-400"
                      : "border-gray-700 text-gray-400"
                  }`}
                >
                  Editor Mode: {editorMode ? "ON" : "OFF"}
                </button>
              )}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
