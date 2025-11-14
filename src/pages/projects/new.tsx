// src/pages/projects/new.tsx
import React from "react";
import ProjectsEditor from "../../components/ProjectsEditor";

export default function NewProjectPage() {
  return (
    <div className="max-w-5xl mx-auto py-10">
      <ProjectsEditor
        mode="create"
        initialData={{ title: "", summary: "", content: "" }}
      />
    </div>
  );
}
