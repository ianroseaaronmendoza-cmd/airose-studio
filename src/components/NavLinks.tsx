import React from 'react';
import { Link } from 'react-router-dom';

const NavLinks = ({
  closeMenu,
  isMobile = false,
}: {
  closeMenu: () => void;
  isMobile?: boolean;
}) => {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/music', label: 'Music' },
    { href: '/projects', label: 'Projects' },
    { href: '/writing', label: 'Writing' },
    { href: '/about', label: 'About' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <div
      className={
        isMobile
          ? 'flex flex-col items-center gap-6 mt-12' // <-- FIXED
          : 'flex items-center gap-6'
      }
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          to={href}
          onClick={closeMenu}
          className={
            isMobile
              ? 'text-2xl text-gray-300 hover:text-pink-400 transition'
              : 'text-sm text-gray-300 hover:text-pink-400 transition'
          }
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
