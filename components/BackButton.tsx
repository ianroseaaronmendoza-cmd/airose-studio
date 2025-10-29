"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label = "Back to Writing" }: { label?: string }) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.back()}
      whileHover={{ x: -4, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 hover:border-pink-400 hover:bg-gray-800 text-gray-300 rounded-lg transition-all"
    >
      <ArrowLeft size={16} className="text-pink-400" />
      <span>{label}</span>
    </motion.button>
  );
}
