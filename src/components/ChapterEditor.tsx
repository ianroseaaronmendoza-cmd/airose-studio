import React, { useEffect, useState } from "react";
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
import ResizableImage from "@/extensions/ResizableImage";
import { uploadImage } from "@/utils/uploadImage"; // NEW

interface ChapterEditorProps {
  initialHtml: string;
  onReady: (editor: any) => void;
}

export default function ChapterEditor({ initialHtml, onReady }: ChapterEditorProps) {
  const [fontColor, setFontColor] = useState("#ffffff");
  const [highlightColor, setHighlightColor] = useState("#000000");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link.configure({ openOnClick: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      ResizableImage,
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ["textStyle"] }),
    ],
    content: initialHtml || "",

    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[350px] p-4 border border-neutral-800 rounded-lg bg-[#0d0d0d] text-gray-100 focus:outline-none",
      },

      //
      // ⭐ DRAG + DROP UPLOAD (fixed)
      //
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;

        event.preventDefault();

        (async () => {
          const url = await uploadImage(file, "novels");
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.image.create({
                src: url,
                width: "auto",
              })
            )
          );
        })();

        return true;
      },
    },
  });

  //
  // Parent receives the editor instance
  //
  useEffect(() => {
    if (editor) onReady(editor);
  }, [editor]);

  if (!editor) return <p className="text-gray-500">Loading editor...</p>;

  //
  // ⭐ FILE PICKER UPLOAD
  //
  async function insertImageFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const url = await uploadImage(file, "novels");
      editor
        ?.chain()
        .focus()
        .setImage({ src: url, width: "auto" } as any)
        .run();
    } catch (err: any) {
      alert("Image upload failed: " + err?.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border border-neutral-800 rounded-lg p-3 bg-neutral-950">

        <ToolBtn label="B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolBtn label="I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolBtn label="U" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />

        <ToolBtn label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <ToolBtn label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolBtn label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

        <ToolBtn label="←" onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <ToolBtn label="↔" onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <ToolBtn label="→" onClick={() => editor.chain().focus().setTextAlign("right").run()} />

        {/* Font Family */}
        <select
          className="bg-neutral-800 text-gray-300 rounded-md px-3 py-1"
          onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
        >
          <option value="inherit">Default</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>

        {/* Font Color */}
        <input
          type="color"
          className="w-8 h-8 rounded border border-neutral-600"
          value={fontColor}
          onChange={e => {
            setFontColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
        />

        {/* Highlight */}
        <input
          type="color"
          className="w-8 h-8 rounded border border-neutral-600"
          value={highlightColor}
          onChange={e => {
            setHighlightColor(e.target.value);
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
          }}
        />

        {/* ⭐ Add Image Button */}
        <label className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded cursor-pointer text-white text-sm">
          🖼 Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={insertImageFromFile}
            className="hidden"
          />
        </label>

        {/* Insert by URL */}
        <button
          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-200 text-sm rounded"
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) editor.chain().focus().setImage({ src: url, width: "auto" } as any).run();
          }}
        >
          🔗 URL
        </button>
      </div>

      {/* The Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolBtn({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded-md ${
        active
          ? "bg-pink-500 text-white"
          : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
      }`}
    >
      {label}
    </button>
  );
}
