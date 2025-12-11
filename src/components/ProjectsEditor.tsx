// src/components/ProjectsEditor.tsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createProject, updateProject } from "../client/api/projects";
import type { Project } from "../client/api/projects";
import { ArrowLeft, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

interface ProjectsEditorProps {
  mode: "create" | "edit";
  slug?: string;
  initialData?: {
    title: string;
    summary: string;
    content: string;
  };
}

export default function ProjectsEditor({
  mode,
  slug,
  initialData = { title: "", summary: "", content: "" },
}: ProjectsEditorProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData.title);
  const [summary, setSummary] = useState(initialData.summary);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialContent, setInitialContent] = useState(initialData.content || "<p>Start writing your project...</p>");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setTitle(initialData.title);
    setSummary(initialData.summary);
    setInitialContent(initialData.content || "<p>Start writing your project...</p>");
  }, [initialData]);

  const handleBack = () => {
    navigate("/projects");
  };

  const handleCancel = () => {
    if (confirm("Are you sure? Unsaved changes will be lost.")) {
      navigate("/projects");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !summary.trim()) {
      alert("Title and summary are required");
      return;
    }
    if (!editorRef.current) return;

    setSaving(true);

    try {
      const content = editorRef.current.getContent();

      const payload: Project = {
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        title,
        description: summary,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (mode === "edit") {
        await updateProject(payload);
        alert("Project updated!");
      } else {
        await createProject(payload);
        alert("Project created!");
      }

      navigate("/projects");
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading editor…</p>;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-neutral-800 rounded-lg transition text-gray-400 hover:text-gray-200"
            title="Back to Projects"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-pink-400">
            {mode === "create" ? "New Project" : "Edit Project"}
          </h1>
        </div>
      </div>

      {/* Title */}
      <input
        className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-200 focus:outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
      />

      {/* Summary */}
      <input
        className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-200 focus:outline-none"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Short description"
      />

      {/* TinyMCE Editor */}
      <div className="bg-neutral-900 border border-neutral-800 rounded">
        <TinyMCEEditor
          apiKey="g7hb7redt7cl6evm9wavtpy2f0mpfxvch87druxrrru3j2a5"
          initialValue={initialContent}
          onInit={(_, editor) => {
            editorRef.current = editor;
            editor.setContent(initialContent);
          }}
          init={{
            height: 400,
            menubar: true,
            plugins: [
              "link",
              "advlist autolink lists image charmap preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table code help wordcount",
              "image",
            ],
            toolbar:
              "undo redo | formatselect | bold italic underline | forecolor backcolor | " +
              "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | link image | code",
            skin: "oxide-dark",
            content_css: "dark",
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          onClick={handleSave}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Project" : "Update Project"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCancel}
          className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-medium flex items-center gap-2"
        >
          <X size={18} />
          Cancel
        </motion.button>
      </div>
    </div>
  );
}
