// app/writing/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEditor } from "@\/app\/context\/EditorContext";
import { BookOpen, PenTool, FileText } from "lucide-react"; // icons!

export default function WritingHub() {
  const { editorMode } = useEditor();

  const sections = [
    {
      title: "Poems",
      desc: "Short verses and lyrical reflections born from still moments.",
      href: "/writing/poems",
      color: "from-pink-500/20 to-pink-800/20",
      icon: <PenTool className="w-6 h-6 text-pink-400" />,
    },
    {
      title: "Novels",
      desc: "Stories that breathe — faith, emotion, and imagination intertwined.",
      href: "/writing/novels",
      color: "from-blue-500/20 to-blue-800/20",
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    },
    {
      title: "Blogs",
      desc: "Personal reflections, creative thoughts, and shared experiences.",
      href: "/writing/blogs",
      color: "from-emerald-500/20 to-emerald-800/20",
      icon: <FileText className="w-6 h-6 text-emerald-400" />,
    },
  ];

  return (
    <main className="max-w-5xl mx-auto py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <h1 className="text-4xl font-bold mb-3 text-pink-400">Writing</h1>
        <p className="text-gray-400 text-lg">
          Explore poems, novels, and blogs — stories and thoughts written from the heart.
        </p>
        {editorMode && (
          <p className="text-xs mt-2 text-green-400">
            ✏️ Editor Mode is ON — management tools are available inside each section.
          </p>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={s.href}
              className={`group block p-6 rounded-2xl bg-gradient-to-br ${s.color} border border-gray-800 hover:border-pink-400 hover:bg-[#111]/60 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center gap-3 mb-3">
                {s.icon}
                <h2 className="text-xl font-semibold">{s.title}</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                {s.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}




