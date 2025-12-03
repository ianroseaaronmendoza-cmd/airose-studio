// src/pages/projects/new.tsx
import React, { lazy, Suspense } from "react";

// Lazy load the editor (it's heavy!)
const ProjectsEditor = lazy(() => import("../../components/ProjectsEditor"));

export default function NewProjectPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
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
