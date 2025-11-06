import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i },
  }),
};

export default function WritingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0e0e0e] to-[#0a0a0a] text-gray-100 py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h1 className="text-4xl font-bold mb-3">Writing Collection</h1>
          <p className="text-gray-400">
            Poems, novels, and blogs — every word written from the heart.
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="grid sm:grid-cols-3 gap-8 mt-14">
          <CategoryCard
            icon={<PenTool size={28} />}
            title="Poems"
            desc="A collection of heartfelt verses and reflections."
            to="/writing/poems"
          />
          <CategoryCard
            icon={<BookOpen size={28} />}
            title="Novels"
            desc="Long-form stories told through faith and imagination."
            to="/writing/novels"
          />
          <CategoryCard
            icon={<FileText size={28} />}
            title="Blogs"
            desc="Thoughts, insights, and updates from Airose Studio."
            to="/writing/blogs"
          />
        </div>
      </div>
    </main>
  );
}

/* ---------------------------
   Category Card Component
   --------------------------- */
function CategoryCard({
  icon,
  title,
  desc,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to: string;
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
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        <p className="mt-4 text-sm text-pink-400 group-hover:text-white transition">
          Explore →
        </p>
      </Link>
    </motion.div>
  );
}
