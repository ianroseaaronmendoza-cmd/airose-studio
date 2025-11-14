import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createBlog, updateBlog } from "../../../../client/api/blogs";
import ResizableImage from "../../../../extensions/ResizableImage";

interface BlogEditorProps {
  mode: "create" | "edit";
  slug?: string;
  initialData: {
    title: string;
    content: string;
    coverImage?: string;
  };
}

export default function BlogEditor({ mode, slug, initialData }: BlogEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialData.title);
  const [coverImage, setCoverImage] = useState(initialData.coverImage || "");
  const [loading, setLoading] = useState(false);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ResizableImage,
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({
        types: ["textStyle"],
      }),
    ],
    content: initialData.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] p-4 border border-neutral-800 rounded-lg bg-[#0d0d0d] text-gray-100 focus:outline-none",
      },

      // Drag-drop + compression
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (files && files.length) {
          const file = files[0];
          if (!file.type.startsWith("image/")) return false;

          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              const MAX_WIDTH = 1000;
              const MAX_HEIGHT = 1000;
              let { width, height } = img;

              if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width *= ratio;
                height *= ratio;
              }

              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);

              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: compressedDataUrl })
                )
              );
            };
            img.src = readerEvent.target?.result as string;
          };
          reader.readAsDataURL(file);

          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  const handleSave = useCallback(async () => {
    if (!title.trim()) return alert("Title is required.");
    setLoading(true);
    try {
      const content = editor?.getHTML() || "";
      const payload = { title, content, coverImage };
      if (mode === "create") {
        await createBlog(payload);
      } else if (slug) {
        await updateBlog(slug, payload);
      }
      navigate("/writing/blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to save blog.");
    } finally {
      setLoading(false);
    }
  }, [editor, title, coverImage, mode, slug, navigate]);

  if (!editor) return <p className="text-gray-500">Loading editor...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-pink-400 mb-6">
        {mode === "create" ? "New Blog" : "Edit Blog"}
      </h1>

      <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl space-y-6 shadow-lg">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Title</label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-200 focus:outline-none focus:border-pink-400"
            placeholder="Enter blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Cover Image URL (optional)</label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-200 focus:outline-none focus:border-pink-400"
            placeholder="https://example.com/cover.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border border-neutral-800 rounded-lg p-3 bg-neutral-950">

          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="U" />

          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" />

          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} label="←" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} label="↔" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} label="→" />

          {/* Link Button */}
          <ToolbarButton
            label="Link"
            onClick={() => {
              const url = prompt("Enter URL:");
              if (!url) return;
              const text = prompt("Text to display:", url) || url;

              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url, target: "_blank", rel: "noopener noreferrer" })
                .insertContent(text)
                .run();
            }}
          />

          {/* Unlink */}
          <ToolbarButton
            label="Unlink"
            onClick={() => editor.chain().focus().unsetLink().run()}
          />

          {/* Font family */}
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="bg-neutral-800 text-gray-300 rounded-md px-2 py-1"
          >
            <option value="inherit">Default</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="cursive">Cursive</option>
          </select>

          {/* Font color */}
          <input
            type="color"
            title="Text Color"
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
            title="Highlight"
            value={bgColor}
            onChange={(e) => {
              setBgColor(e.target.value);
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
            }}
            className="w-8 h-8 cursor-pointer border border-neutral-700 rounded-md"
          />
        </div>

        <EditorContent editor={editor} />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Publish Blog" : "Update Blog"}
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
