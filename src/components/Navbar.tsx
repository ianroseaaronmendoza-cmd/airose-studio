import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
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
      </div>
    </nav>
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
      className="block px-4 py-2 text-gray-300 hover:bg-neutral-800 hover:text-pink-400 rounded-lg transition"
    >
      {children}
    </Link>
  );
}