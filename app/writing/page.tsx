"use client";

export default function WritingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-4xl md:text-5xl font-bold text-pink-400 mb-6">🖋 Writing</h1>
      <p className="text-gray-400 text-lg mb-10">
        Reflections, poems, and short stories from the heart of Airose.  
        Each piece carries a glimpse of worship, faith, and creative honesty.
      </p>

      {/* Example entry */}
      <article className="mb-12 bg-[#0e0e0e] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/40 transition">
        <h2 className="text-2xl font-semibold text-white mb-2">The Beauty in Silence</h2>
        <p className="text-gray-400 leading-relaxed">
          There are moments when words fail, and silence becomes the most beautiful prayer.
          Sometimes the loudest worship is not a song — but stillness.
        </p>
      </article>

      <article className="mb-12 bg-[#0e0e0e] border border-gray-800 rounded-2xl p-6 hover:border-pink-500/40 transition">
        <h2 className="text-2xl font-semibold text-white mb-2">When Faith Feels Small</h2>
        <p className="text-gray-400 leading-relaxed">
          Even mustard-sized faith can move mountains — not because of the size of your faith,
          but because of the power of the One you trust.
        </p>
      </article>

      <p className="text-gray-500 text-sm text-center mt-12">
        More writings coming soon...
      </p>
    </div>
  );
}
