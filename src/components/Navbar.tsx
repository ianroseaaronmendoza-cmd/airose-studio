import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="bg-neutral-900 border-b border-neutral-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-pink-400">
              Airose Studio
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/projects">Projects</NavLink>
              <NavLink to="/blogs">Blogs</NavLink>
              <NavLink to="/music">Music</NavLink>
              <NavLink to="/novels">Novels</NavLink>
              <NavLink to="/poems">Poems</NavLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-pink-400"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel - moved outside nav */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col items-center justify-center">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-md text-white hover:bg-neutral-800"
            aria-label="Close menu"
          >
            <X size={32} />
          </button>
          <MobileNavLink to="/projects" onClick={() => setIsOpen(false)}>
            Projects
          </MobileNavLink>
          <MobileNavLink to="/blogs" onClick={() => setIsOpen(false)}>
            Blogs
          </MobileNavLink>
          <MobileNavLink to="/music" onClick={() => setIsOpen(false)}>
            Music
          </MobileNavLink>
          <MobileNavLink to="/novels" onClick={() => setIsOpen(false)}>
            Novels
          </MobileNavLink>
          <MobileNavLink to="/poems" onClick={() => setIsOpen(false)}>
            Poems
          </MobileNavLink>
        </div>
      )}
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-gray-300 hover:text-pink-400 transition"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ 
  to, 
  children, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-6 py-4 text-lg text-gray-200 hover:bg-neutral-800 hover:text-pink-400 rounded-xl transition text-center"
    >
      {children}
    </Link>
  );
}