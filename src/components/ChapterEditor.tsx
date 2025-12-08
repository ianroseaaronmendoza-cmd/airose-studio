import React, { useRef, useEffect } from "react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

interface ChapterEditorProps {
  initialHtml: string;
  onReady: (editor: any) => void;
}

export default function ChapterEditor({ initialHtml, onReady }: ChapterEditorProps) {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) onReady(editorRef.current);
  }, [editorRef.current, onReady]);

  // Add handlers for Cancel and Save
  const handleCancel = () => {
    // Implement your cancel logic here, e.g., reset editor or close modal
    if (editorRef.current) {
      editorRef.current.setContent(initialHtml);
    }
  };

  const handleSave = () => {
    // Implement your save logic here, e.g., get content and send to backend
    const html = editorRef.current?.getContent() || "";
    // You can add your save logic here, e.g., call a prop or API
    console.log("Saved HTML:", html);
  };

  return (
    <>
      <TinyMCEEditor
        apiKey="g7hb7redt7cl6evm9wavtpy2f0mpfxvch87druxrrru3j2a5"
        initialValue={initialHtml}
        onInit={(_, editor) => {
          editorRef.current = editor;
          editor.setContent(initialHtml);
          onReady(editor);
        }}
        init={{
          height: 400,
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
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-pink-400 text-pink-400 bg-transparent hover:bg-pink-400 hover:text-white rounded font-semibold transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-white"
        >
          Save Chapter
        </button>
      </div>
    </>
  );
}

// If you need to get the HTML content, do it inside the ChapterEditor component or via a callback.
// For example, you can add a function inside ChapterEditor to get the content:
// const html = editorRef.current?.getContent() || "";
