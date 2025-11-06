// src/components/Footer.tsx
import React from "react";
import {
  FaInstagram,
  FaSpotify,
  FaYoutube,
  FaFacebook,
  FaBookOpen,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full text-gray-400 text-sm py-6 border-t border-neutral-800 mt-10
      bg-black md:backdrop-blur-md md:bg-black/80 md:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]
      md:fixed md:bottom-0 md:left-0 md:z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
        {/* Left Section — Brand Info */}
        <div className="text-center md:text-left leading-relaxed">
          © 2025{" "}
          <span className="text-white font-semibold">Airose Official</span> —{" "}
          <a
            href="/"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            Airose Studio
          </a>
          . All rights reserved.
        </div>

        {/* Right Section — Social Links */}
        <div className="flex items-center gap-5 text-lg">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/airose_official/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 hover:scale-110 transition-transform duration-200"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>

          {/* Spotify */}
          <a
            href="https://open.spotify.com/artist/7siLh2Wz78DXsMBsS3HRGG?si=a63e8dc426ba4ce0"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 hover:scale-110 transition-transform duration-200"
            aria-label="Spotify"
          >
            <FaSpotify />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@AiroseOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 hover:scale-110 transition-transform duration-200"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>

          {/* Wattpad */}
          <a
            href="https://www.wattpad.com/user/Mazedon"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-400 hover:scale-110 transition-transform duration-200"
            aria-label="Wattpad"
          >
            <FaBookOpen />
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/airoseofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 hover:scale-110 transition-transform duration-200"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
        </div>
      </div>

      {/* Bottom Motto */}
      <div className="text-center text-xs mt-4 select-none">
        <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400 bg-clip-text text-transparent font-medium tracking-wide italic">
          Soli Deo Gloria
        </span>
      </div>
    </footer>
  );
}
