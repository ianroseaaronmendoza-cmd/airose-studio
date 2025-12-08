import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor } from "@/context/EditorContext";
import BackButton from "@/components/BackButton";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

interface BlogEditorProps {
  initial: {
    title: string;
    content: string;
    coverImage: string;
  };
  onSaved: (saved: { slug: string }) => void | Promise<void>;
}

export default function BlogEditor({ initial, onSaved }: BlogEditorProps) {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState(initial.title);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialContent, setInitialContent] = useState(initial.content);
  const editorRef = useRef<any>(null);

  const isNew = !slug;

  // Block if not in editor mode
  useEffect(() => {
    if (!editorMode) {
      navigate(slug ? `/writing/blogs/${slug}` : "/writing/blogs");
    }
  }, [editorMode, navigate, slug]);

  // Load blog if editing
  useEffect(() => {
    if (!isNew && slug) {
      (async () => {
        try {
          const res = await fetch(`/data/blogs/${slug}.json`);
          if (res.ok) {
            const data = await res.json();
            setTitle(data.title || "");
            setInitialContent(data.content || data.body || "<p>Start writing your blog...</p>");
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
  }, [isNew, slug]);

  // Save blog
  async function handleSave() {
    if (!title.trim()) return alert("Title is required");
    if (!editorRef.current) return;

    setSaving(true);

    try {
      const html = editorRef.current.getContent();

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

      onSaved(saved);

      navigate(`/writing/blogs/${saved.slug}`);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editorMode) return null;

  if (loading) {
    return <div className="text-gray-400 p-10">Loading...</div>;
  }

  return (
    <div className="w-full px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
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
            className="w-full bg-neutral-900 border border-neutral-800 rounded text-white px-4 py-2"
          />
        </div>

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
              height: 500,
              menubar: true,
              plugins: [
                "advlist autolink lists link image charmap preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table code help wordcount",
                "image", // <-- Ensure 'image' plugin is included
              ],
              toolbar:
                "undo redo | formatselect | bold italic underline | forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | image | code", // <-- Ensure 'image' is in the toolbar
              skin: "oxide-dark",
              content_css: "dark",
              // Remove images_upload_handler if you have no backend!
            }}
          />
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
