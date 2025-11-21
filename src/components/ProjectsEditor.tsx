// src/components/ProjectsEditor.tsx
import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

import { createProject, updateProject } from "../client/api/projects";
import { motion } from "framer-motion";

// ALWAYS use relative /api paths
const API_BASE = "/api";

interface ProjectsEditorProps {
  mode: "create" | "edit";
  slug?: string;
  initialData: {
    title: string;
    summary: string;
    content: string;
  };
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectsEditor({ mode, slug, initialData }: ProjectsEditorProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData.title);
  const [summary, setSummary] = useState(initialData.summary);
  const [saving, setSaving] = useState(false);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

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

  useEffect(() => {
    if (editor && initialData.content) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData]);

  // --- SAVE HANDLER ---
  const handleSave = useCallback(async () => {
    if (!title.trim()) return alert("Title is required.");
    setSaving(true);

    try {
      const content = editor?.getHTML() || "";

      if (mode === "create") {
        const generatedSlug = slugify(title);
        await createProject({ title, summary, content, slug: generatedSlug });
        navigate("/projects");
      } else if (mode === "edit" && slug) {
        await updateProject(slug, { title, summary, content });
        navigate(`/projects/${slug}`);
      }
    } catch (err) {
      console.error("Project save failed:", err);
      alert("Failed to save project.");
    } finally {
      setSaving(false);
    }
  }, [title, summary, editor, slug, mode, navigate]);

  // --- IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(`${API_BASE}/uploads/projects`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        console.error("Upload failed:", await res.text());
        alert("Image upload failed");
        return;
      }

      const json = await res.json();
      const fullUrl = json.url;

      editor?.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      e.target.value = "";
    }
  };

  if (!editor) return <p className="text-gray-400">Loading editor…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        {mode === "create" ? "New Project" : "Edit Project"}
      </h1>

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
        {/* Formatting buttons */}
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        {/* Alignment */}
        <ToolbarButton label="←" onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <ToolbarButton label="↔" onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <ToolbarButton label="→" onClick={() => editor.chain().focus().setTextAlign("right").run()} />

        {/* Font Family */}
        <select
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
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

        {/* Image Upload */}
        <label className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer text-sm">
          Image
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      <EditorContent editor={editor} />

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={saving}
        onClick={handleSave}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : mode === "create" ? "Create Project" : "Update Project"}
      </motion.button>
    </div>
  );
}

function ToolbarButton({ onClick, active, label }: { onClick: () => void; active?: boolean; label: string }) {
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
