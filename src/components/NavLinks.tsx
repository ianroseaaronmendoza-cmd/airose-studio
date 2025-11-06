// src/components/NavLinks.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import from react-router-dom

const NavLinks = ({ closeMenu, isMobile = false }: { closeMenu: () => void, isMobile?: boolean }) => {
  const links = [
    { href: "/", label: "Home" },
    { href: "/music", label: "Music" },
    { href: "/projects", label: "Projects" },
    { href: "/writing", label: "Writing" },
    { href: "/about", label: "About" },
    { href: "/support", label: "Support" }
  ];

  return (
    <>
      {links.map(({ href, label }) => (
        <Link key={href} to={href} onClick={closeMenu} className={`${isMobile ? "text-gray-300 hover:text-pink-400 text-base transition" : "text-sm text-gray-300 hover:text-pink-400 transition"}`}>
          {label}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
