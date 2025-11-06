// src/pages/ProjectsPage.tsx
import React from "react";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-10">
      <section className="max-w-5xl mx-auto bg-[#18181b] p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-pink-400 mb-4">
          Featured Projects
        </h1>
        <p className="text-gray-400 mb-6">
          Explore some of our recent and upcoming creative tools built by Airose
          Official.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[#1f1f23] p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform">
            <h2 className="text-xl font-semibold text-pink-400 mb-2">
              Airose Lyric Video Maker
            </h2>
            <p className="text-gray-400 text-sm">
              Create beautiful lyric videos with minimal effort and dynamic
              animations.
            </p>
          </div>

          <div className="bg-[#1f1f23] p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform">
            <h2 className="text-xl font-semibold text-pink-400 mb-2">
              Airose Harmony Trainer
            </h2>
            <p className="text-gray-400 text-sm">
              Train your harmony skills and generate vocal layers intelligently.
            </p>
          </div>

          <div className="bg-[#1f1f23] p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform">
            <h2 className="text-xl font-semibold text-pink-400 mb-2">
              Airose Refiner Mini
            </h2>
            <p className="text-gray-400 text-sm">
              Compact lyric syncing and timestamp tool for quick worship media
              prep.
            </p>
          </div>

          <div className="bg-[#1f1f23] p-6 rounded-xl shadow-md hover:-translate-y-1 transition-transform">
            <h2 className="text-xl font-semibold text-pink-400 mb-2">
              Airose Data Consolidator
            </h2>
            <p className="text-gray-400 text-sm">
              Combine and process journal data files effortlessly in one click.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
