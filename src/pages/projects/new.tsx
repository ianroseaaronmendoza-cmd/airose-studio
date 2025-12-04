// src/pages/projects/new.tsx
import React, { lazy, Suspense } from "react";

// Lazy load the editor (it's heavy!)
const ProjectsEditor = lazy(() => import("../../components/ProjectsEditor"));

export default function NewProjectPage() {
  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <Suspense fallback={<div className="text-gray-400 text-center py-10">Loading editor...</div>}>
        <ProjectsEditor
          mode="create"
          initialData={{
            title: "",
            summary: "",
            content: "",
          }}
        />
      </Suspense>
    </div>
  );
}
