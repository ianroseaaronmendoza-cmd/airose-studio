import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import ResizableImage from "@/extensions/ResizableImage";
import slugify from "slugify";
import { uploadImage } from "@/utils/uploadImage";
import { saveBlog } from "@/client/api/blogs";

interface BlogEditorProps {
  initial?: any;
  onSaved?: (data: any) => void;
}

export default function BlogEditor({ initial, onSaved }: BlogEditorProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Write your blog content here...",
      }),
    ],
    content: initial?.content || "",
    autofocus: "end",
    editorProps: {
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;

        event.preventDefault();

        (async () => {
          const url = await uploadImage(file, "blogs");
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

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const url = await uploadImage(file, "blogs");
      editor?.chain().focus().setImage({ src: url, width: "auto" } as any).run();
    } catch (err: any) {
      alert("Image upload failed: " + err);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");
    if (!editor) return;

    setSaving(true);

    const content = editor.getHTML();
    const slug = initial?.slug || slugify(title, { lower: true });

    const payload = {
      slug,
      title: title.trim(),
      content,
      createdAt: initial?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const saved = await saveBlog(payload);
      onSaved?.(saved);
      alert("Blog saved!");
    } catch (err: any) {
      alert("Failed: " + err);
    } finally {
      setSaving(false);
    }
  };

  const toolbar = (
    <div className="flex items-center gap-3 flex-wrap mb-3">
      <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 bg-neutral-800 rounded">
        B
      </button>
      <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 bg-neutral-800 rounded">
        I
      </button>
      <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className="px-2 py-1 bg-neutral-800 rounded">
        U
      </button>
      <button onClick={() => editor?.chain().focus().setTextAlign("left").run()} className="px-2 py-1 bg-neutral-800 rounded">
        Left
      </button>
      <button onClick={() => editor?.chain().focus().setTextAlign("center").run()} className="px-2 py-1 bg-neutral-800 rounded">
        Center
      </button>
      <button onClick={() => editor?.chain().focus().setTextAlign("right").run()} className="px-2 py-1 bg-neutral-800 rounded">
        Right
      </button>

      <label className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded cursor-pointer text-white ml-4">
        Insert Image
        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="ml-auto px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        {saving ? "Saving..." : "Save Blog"}
      </button>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-4 text-gray-100">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog Title"
        className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 rounded"
      />

      {toolbar}

      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
