// src/pages/writing/novels/new.tsx
import React, { useState } from "react";
import BackButton from "../../../components/BackButton";
import NovelForm, { NovelMeta } from "@/components/NovelForm";

export default function NewNovelPage() {
  const [savedNovel, setSavedNovel] = useState<NovelMeta | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-8">
      <div className="w-full sm: lg: px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
        {/* Back navigation */}
        <BackButton />

        {/* Page heading */}
        <h1 className="text-3xl font-bold mb-8 text-pink-400">Create New Novel</h1>
        <p className="text-gray-400 mb-6">
          Start your next story project. You can edit its synopsis, note, or cover later.
        </p>

        {/* Shared Form */}
        <NovelForm 
          key="new-novel-form" 
          initial={null}
          onSaved={(meta) => {
            setSavedNovel(meta);
            // Don't navigate here - let NovelForm handle it
          }}
        />
      </div>
    </div>
  );
}
