import React from "react";
import { Link } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import { motion, AnimatePresence } from "framer-motion";
import { isDev } from "@/lib/env";

interface HeaderProps {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export default function Header({ menuOpen, toggleMenu, closeMenu }: HeaderProps) {
  const { editorMode, toggleEditor } = useEditor();

  return (
    <header className="relative z-[100000] flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-[#080808]/95 backdrop-blur">
      
      {/* Brand */}
      <div className="text-lg font-semibold tracking-wide select-none">
        <span className="text-pink-400">Airose Studio</span> by Airose Official
      </div>

      {/* DESKTOP NAV - FORCE HIDDEN ON MOBILE */}
      <nav className="hidden lg:flex space-x-6 items-center">
        <Link to="/" className="hover:text-pink-400 transition">Home</Link>
        <Link to="/moment" className="hover:text-pink-400 transition">Moment</Link> {/* <-- Moved here */}
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

      {/* MOBILE BUTTON */}
      <button
        className="lg:hidden p-2 rounded-md text-pink-400 hover:bg-neutral-900 hover:text-white transition"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* MOBILE MENU + OVERLAY */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* FULLSCREEN DIM BACKGROUND */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black backdrop-blur-sm z-[9998]"
            />

            {/* SIDE DRAWER */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed top-0 right-0 h-full w-64 bg-[#0b0b0b] border-l border-gray-800 p-6 shadow-xl z-[9999] flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-pink-400">Menu</div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-md text-pink-400 hover:bg-neutral-900 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-4 mt-6 text-lg">
                <Link to="/" onClick={closeMenu}>Home</Link>
                <Link to="/moment" onClick={closeMenu}>Moment</Link> {/* <-- Moved here */}
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
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
