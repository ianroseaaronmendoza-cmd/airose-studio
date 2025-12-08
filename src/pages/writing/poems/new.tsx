import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../../../context/EditorContext";
import BackButton from "../../../components/BackButton";
import { createPoem, slugifyText } from "../../../client/api/poems";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

export default function NewPoemPage() {
  const navigate = useNavigate();
  const { editorMode } = useEditor();

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editorRef.current?.getContent() || "";
    if (!title.trim() || !content.trim()) return alert("Fill all fields");

    setSaving(true);

    const slug = slugifyText(title);

    await createPoem({ slug, title, content });

    window.dispatchEvent(new Event("poemUpdated"));
    navigate("/writing/poems");
  };

  if (!editorMode)
    return (
      <div className="p-6 text-center text-gray-400">
        <BackButton label="Back to Poems" />
        <p className="mt-6">Enable Editor Mode to create poems.</p>
      </div>
    );

  return (
    <div className="w-full text-gray-100 pb-32 px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32 py-10">
      <BackButton label="Back to Poems" />
      <h1 className="text-2xl font-bold mt-4 mb-6">New Poem</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded border border-gray-700 focus:border-pink-500 px-4 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Content</label>
          <TinyMCEEditor
            apiKey="g7hb7redt7cl6evm9wavtpy2f0mpfxvch87druxrrru3j2a5"
            initialValue="<p>Start writing your poem...</p>"
            onInit={(_, editor) => {
              editorRef.current = editor;
            }}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                "advlist autolink lists link image charmap preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table code help wordcount",
                "image",
              ],
              toolbar:
                "undo redo | formatselect | bold italic underline | forecolor backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | image | code",
              skin: "oxide-dark",
              content_css: "dark",
            }}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Poem"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/writing/poems")}
            className="px-6 py-2 border border-gray-600 hover:border-gray-400 rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
