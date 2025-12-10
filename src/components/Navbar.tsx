import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* NAVBAR HEADER */}
      <nav className="bg-neutral-900 border-b border-neutral-800 z-50 relative">
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
              <NavLink to="/moment">Moment</NavLink> {/* <-- Add this line */}
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

      {/* FULLSCREEN MOBILE PANEL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur-md flex flex-col items-center pt-20 px-6">
          
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-md text-white hover:bg-neutral-800"
            aria-label="Close menu"
          >
            <X size={32} />
          </button>

          {/* Menu Links */}
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

          <MobileNavLink to="/moment" onClick={() => setIsOpen(false)}>
            Moment
          </MobileNavLink> {/* <-- Add this line */}
        </div>
      )}
    </>
  );
}

/* DESKTOP NAV LINK */
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

/* MOBILE NAV LINK */
function MobileNavLink({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-6 py-4 text-2xl text-gray-200 hover:bg-neutral-800 hover:text-pink-400 rounded-xl transition text-center"
    >
      {children}
    </Link>
  );
}
