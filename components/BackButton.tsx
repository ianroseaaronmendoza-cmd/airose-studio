"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  href?: string;
  label?: string;
  className?: string;
  useFallbackBack?: boolean;
};

export default function BackButton({
  href,
  label = "Back",
  className = "",
  useFallbackBack = true,
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else if (useFallbackBack) router.back();
    else router.push("/writing");
  };

  const ButtonContent = (
    <motion.div
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-pink-400 transition-colors" />
      <span>{label}</span>
    </motion.div>
  );

  return href ? (
    <Link
      href={href}
      className={`inline-block px-4 py-2 rounded-lg border border-gray-700 text-gray-300 bg-gray-900/60 hover:bg-gray-800 hover:text-pink-400 transition-all duration-200 group ${className}`}
    >
      {ButtonContent}
    </Link>
  ) : (
    <button
      onClick={handleClick}
      className={`inline-block px-4 py-2 rounded-lg border border-gray-700 text-gray-300 bg-gray-900/60 hover:bg-gray-800 hover:text-pink-400 transition-all duration-200 group ${className}`}
    >
      {ButtonContent}
    </button>
  );
}
