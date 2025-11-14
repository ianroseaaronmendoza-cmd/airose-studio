// src/pages/writing/novels/new.tsx
import React from "react";
import BackButton from "../../../components/BackButton";
import NovelForm from "../../../components/NovelForm";

export default function NewNovelPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100">
      {/* Back navigation */}
      <BackButton />

      {/* Page heading */}
      <h2 className="text-3xl font-bold text-pink-400 mb-2">Create New Novel</h2>
      <p className="text-gray-400 mb-6">
        Start your next story project. You can edit its synopsis, note, or cover later.
      </p>

      {/* Shared Form */}
      <NovelForm mode="create" />
    </div>
  );
}
