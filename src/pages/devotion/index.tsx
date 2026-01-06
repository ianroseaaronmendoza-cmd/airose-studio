import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i },
  }),
};

export default function DevotionIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] text-gray-100 py-20 px-6">
      <div className="w-full text-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h1 className="text-4xl font-bold mb-3 !text-pink-400">
            Daily Devotion
          </h1>
          <p className="text-gray-400">
            Morning and Evening readings by Charles H. Spurgeon
          </p>
        </motion.div>

        {/* Devotion Cards */}
        <div className="grid sm:grid-cols-2 gap-8 mt-14">
          <DevotionCard
            icon={<Sun size={28} />}
            title="Morning Devotion"
            desc="Start your day with spiritual encouragement and insight."
            to="/devotion/morning"
            emoji="☀️"
          />
          <DevotionCard
            icon={<Moon size={28} />}
            title="Evening Devotion"
            desc="Reflect and find peace with an evening reading."
            to="/devotion/evening"
            emoji="🌙"
          />
        </div>
      </div>
    </main>
  );
}

function DevotionCard({
  icon,
  title,
  desc,
  to,
  emoji,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
  emoji: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="rounded-2xl bg-[#111]/60 border border-gray-800 p-8 shadow-md hover:border-pink-500/50 transition-colors backdrop-blur-sm"
    >
      <Link to={to} className="block text-left group">
        <div className="flex items-center gap-3 mb-4 text-pink-400 group-hover:text-pink-300 transition">
          {icon}
          <h2 className="text-xl font-semibold !text-pink-400">{title}</h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        <p className="mt-4 text-sm text-pink-400 group-hover:text-white transition">
          {emoji} Read Now →
        </p>
      </Link>
    </motion.div>
  );
}
