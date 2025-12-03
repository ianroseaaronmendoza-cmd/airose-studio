import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";
import { uploadImage } from "@/utils/uploadImage";

// Tiptap imports
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

export default function BlogEditorPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isNew = !slug;

  // Block if not in editor mode
  useEffect(() => {
    if (!editorMode) {
      navigate(slug ? `/writing/blogs/${slug}` : "/writing/blogs");
    }
  }, [editorMode, navigate, slug]);

  // Tiptap editor
  const editor = useTiptapEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-pink-400 underline",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // Load blog if editing
  useEffect(() => {
    if (!isNew && slug) {
      (async () => {
        try {
          const res = await fetch(`/data/blogs/${slug}.json`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title || "");
            if (editor) {
              editor.commands.setContent(data.content || data.body || "");
            }
          }
        } catch (err) {
          console.error("Load failed:", err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [isNew, slug, editor]);

  // Save blog
  async function handleSave() {
    if (!title.trim()) return alert("Title is required");
    if (!editor) return;

    setSaving(true);

    try {
      const html = editor.getHTML();

      const res = await fetch("/dev/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: isNew ? undefined : slug,
          title: title.trim(),
          content: html,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const { saved } = await res.json();
      alert("Blog saved!");

      navigate(`/writing/blogs/${saved.slug}`);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  // Insert image
  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const url = await uploadImage(file, "blogs");
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (err: any) {
        alert("Image upload failed: " + err.message);
      }
    };
    input.click();
  }

  // Add link
  function handleAddLink() {
    const url = prompt("Enter URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  if (!editorMode) return null;

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <BackButton to="/writing/blogs" label="Back to Blogs" />

      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        {isNew ? "New Blog Post" : "Edit Blog Post"}
      </h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-400 mb-2">Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog title"
            className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded text-white"
          />
        </div>

        {/* Content Editor */}
        <div className="bg-neutral-900 border border-neutral-800 rounded">
          {/* Toolbar */}
          <div className="border-b border-neutral-800 p-2 flex gap-2 flex-wrap">
            {/* Text Formatting */}
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("bold") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("italic") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("underline") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <u>U</u>
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("strike") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <s>S</s>
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Headings */}
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("heading", { level: 1 }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              H1
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("heading", { level: 2 }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              H2
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("heading", { level: 3 }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              H3
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Lists */}
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("bulletList") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              • List
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("orderedList") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              1. List
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Alignment */}
            <button
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive({ textAlign: "left" }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              ⬅
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive({ textAlign: "center" }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              ⬌
            </button>
            <button
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive({ textAlign: "right" }) ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              ➡
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Link & Image */}
            <button
              onClick={handleAddLink}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("link") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              🔗 Link
            </button>
            <button
              onClick={handleImageUpload}
              className="px-3 py-1 rounded text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              🖼️ Image
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Quote & Code */}
            <button
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("blockquote") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              " Quote
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              className={`px-3 py-1 rounded text-sm ${
                editor?.isActive("codeBlock") ? "bg-pink-600" : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              &lt;/&gt; Code
            </button>

            <div className="w-px bg-neutral-700" />

            {/* Undo/Redo */}
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              className="px-3 py-1 rounded text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              ↶ Undo
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              className="px-3 py-1 rounded text-sm bg-neutral-800 hover:bg-neutral-700"
            >
              ↷ Redo
            </button>
          </div>

          {/* Editor */}
          <EditorContent editor={editor} />
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/writing/blogs")}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Blog"}
          </button>
        </div>
      </div>
    </div>
  );
}
