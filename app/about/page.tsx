"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, Book, Sparkles, Heart } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i },
  }),
};

// Use React.PropsWithChildren so TypeScript knows these accept children
function Card({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-md backdrop-blur-sm">
      {children}
    </div>
  );
}
function CardContent({ children }: React.PropsWithChildren<{}>) {
  return <div>{children}</div>;
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0b1220] to-[#0b0f15] text-slate-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 via-teal-500 to-indigo-500 flex items-center justify-center shadow-2xl">
              <span className="font-semibold text-white tracking-wider">AR</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                About Airose Official
              </h1>
              <p className="text-slate-300 mt-1">
                â€œWhere imagination turns into craft.â€
              </p>
            </div>
          </motion.div>
        </motion.header>

        {/* Intro / Heart */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <motion.div variants={fadeUp} custom={1} className="prose prose-invert max-w-none">
            <p>
              Airose isnâ€™t a company or a brand. Itâ€™s a small shelf on the internet where
              curiosity gets to breathe â€” songs, poems, tiny tools, and ideas that somehow
              turned into something you can hold. None of this was planned. Most of it was a
              happy accident.
            </p>
            <p>
              This place is for people who tinker, who write a line of code and then a line
              of lyrics, who like to see where a question will go if you try to follow it.
            </p>
          </motion.div>
        </motion.section>

        {/* Two-column story + note */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="md:col-span-2"
          >
            <Card>
              <CardContent>
                <h2 className="text-xl font-medium mb-2">The story behind the name</h2>
                <p className="text-slate-300 leading-relaxed">
                  Funny thing â€” the name <strong>â€œAiroseâ€</strong> wasnâ€™t dreamed up to sound
                  poetic. It came from an online friend while I was trying to find an unused
                  username for a game. She scrambled the letters of my real name and joked,
                  â€œIâ€™ll call you Airose.â€ I tried it, it was available, and Iâ€™ve used it
                  ever since. For the record â€” she never actually called me Airose. (Laughs.)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.aside
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={3}
            className="mt-2"
          >
            <div className="rounded-xl p-6 bg-gradient-to-tr from-black/40 to-white/2 border border-white/6 shadow-lg">
              <h3 className="text-sm font-semibold text-amber-300 mb-2">A quick note</h3>
              <p className="text-slate-300 text-sm">
                This site holds songs, poems, small apps, and ministry â€” all of it a little
                rough, mostly honest.
              </p>
            </div>
          </motion.aside>
        </div>

        {/* About me + works */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-semibold mb-4">
            About me
          </motion.h2>
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  Iâ€™m <strong>Ian Mendoza</strong> â€” a product engineer by day and a curious
                  creator by heart. Most of what lives here began as experiments. I never set
                  out to build a product lineup; I followed small questions and watched what
                  grew.
                </p>
                <p className="mt-3 text-slate-300">
                  Some sparks became songs. Some became stories. Some became the little apps
                  you might stumble upon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4 className="font-medium mb-3">What youâ€™ll find here</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-3">
                    <Music size={16} /> Music & small recordings
                  </li>
                  <li className="flex items-center gap-3">
                    <Book size={16} /> Stories & poems
                  </li>
                  <li className="flex items-center gap-3">
                    <Sparkles size={16} /> Curiosity-built apps
                  </li>
                  <li className="flex items-center gap-3">
                    <Heart size={16} /> Ministry work
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Closing quote */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <blockquote className="border-l-2 border-amber-400 pl-5 text-slate-200 italic bg-gradient-to-tr from-white/2 to-black/0 rounded-md p-4">
            <p className="mb-2">
              â€œThe creative God created us to be creative. Iâ€™m just fulfilling that role.â€
            </p>
            <cite className="not-italic text-slate-400">â€” Ian Mendoza</cite>
          </blockquote>
        </motion.section>

        {/* Footer */}
        <footer className="mt-10 text-center text-slate-400 text-sm">
          <p>Made with curiosity â€” Airose Official</p>
        </footer>
      </div>
    </main>
  );
}

