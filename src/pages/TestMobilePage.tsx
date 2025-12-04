import React from "react";

export default function TestMobilePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <div className="w-full sm: lg: space-y-8 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-400">
          Mobile Test Page
        </h1>

        {/* Test responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-neutral-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Card {i}</h3>
              <p className="text-gray-400">Test content</p>
            </div>
          ))}
        </div>

        {/* Test responsive text */}
        <div className="prose prose-invert max-w-none">
          <p className="text-sm sm:text-base lg:text-lg">
            This text should scale based on screen size.
          </p>
        </div>

        {/* Test buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="px-6 py-3 bg-pink-500 text-white rounded-lg">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-neutral-800 text-white rounded-lg">
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  );
}