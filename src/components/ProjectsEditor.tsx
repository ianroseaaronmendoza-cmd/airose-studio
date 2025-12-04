// src/components/ProjectsEditor.tsx
import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createProject, updateProject } from "../client/api/projects";
import type { Project } from "../client/api/projects";
import { ArrowLeft, X } from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import ResizableImage from "../extensions/ResizableImage";
import { uploadImage } from "@/utils/uploadImage";

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
  initialData = { title: "", summary: "", content: "" }, // ✅ Default value
}: ProjectsEditorProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData.title);
  const [summary, setSummary] = useState(initialData.summary);
  const [saving, setSaving] = useState(false);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

  // ------------------------------------------------------
  // Tiptap Editor
  // ------------------------------------------------------
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ["textStyle"] }),
      ResizableImage,
    ],
    content: initialData.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[350px] p-4 border border-neutral-800 rounded-lg bg-[#0d0d0d] text-gray-100 focus:outline-none",
      },
    },
  });

  // Update editor when initial data updates (edit mode load)
  useEffect(() => {
    if (editor && initialData.content) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData]);

  // ------------------------------------------------------
  // Navigation Handlers
  // ------------------------------------------------------
  const handleBack = () => {
    navigate("/projects");
  };

  const handleCancel = () => {
    if (confirm("Are you sure? Unsaved changes will be lost.")) {
      navigate("/projects");
    }
  };

  // ------------------------------------------------------
  // Save Handler
  // ------------------------------------------------------
  const handleSave = useCallback(async () => {
    if (!title.trim() || !summary.trim()) {
      alert("Title and summary are required");
      return;
    }

    if (!editor) return;

    setSaving(true);

    try {
      const content = editor.getHTML();

      // Construct the full project object
      const payload: Project = {
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"), // Use existing slug or generate from title
        title,
        description: summary,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Add other fields as needed
      };

      if (mode === "edit") {
        // Pass the complete project object
        await updateProject(payload);
        alert("Project updated!");
      } else {
        // For create mode, you'll need a createProject function
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
  }, [title, summary, editor, slug, mode, navigate]);

  // ------------------------------------------------------
  // Link Handling
  // ------------------------------------------------------
  const addLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;

    const text = prompt("Text to display:") || url;

    editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      )
      .run();
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  // ------------------------------------------------------
  // Image Upload
  // ------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // ✅ Use the utility - it already handles everything correctly
      const url = await uploadImage(file, "projects");

      // Insert image into editor (your existing insertion code)
      // Example:
      const img = `<img src="${url}" alt="${file.name}" />`;
      editor?.chain().focus().setImage({ src: url }).run();

      console.log("✅ Image uploaded:", url);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (!editor) return <p className="text-gray-400">Loading editor…</p>;

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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border border-neutral-800 rounded-lg p-3 bg-neutral-950">
        {/* Bold / Italic / Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="B"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="I"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          label="U"
        />

        {/* Headings */}
        <ToolbarButton
          label="H1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <ToolbarButton
          label="H2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label="H3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />

        {/* Alignment */}
        <ToolbarButton
          label="←"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          label="↔"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          label="→"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />

        {/* Font Family */}
        <select
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          className="bg-neutral-800 text-gray-300 rounded-md px-2 py-1"
        >
          <option value="inherit">Default</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>

        {/* Text Color */}
        <input
          type="color"
          value={fontColor}
          onChange={(e) => {
            setFontColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="w-8 h-8 cursor-pointer border border-neutral-700 rounded-md"
        />

        {/* Highlight */}
        <input
          type="color"
          value={bgColor}
          onChange={(e) => {
            setBgColor(e.target.value);
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
          }}
          className="w-8 h-8 cursor-pointer border border-neutral-700 rounded-md"
        />

        {/* Link */}
        <button
          className="px-3 py-1 bg-neutral-800 rounded-md text-sm"
          onClick={addLink}
        >
          🔗 Add Link
        </button>

        <button
          className="px-3 py-1 bg-neutral-800 rounded-md text-sm"
          onClick={removeLink}
        >
          ❌ Unlink
        </button>

        {/* Image Upload */}
        <label className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer text-sm">
          Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      <EditorContent editor={editor} />

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

function ToolbarButton({
  onClick,
  active,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md transition ${
        active ? "bg-pink-500 text-white" : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}
