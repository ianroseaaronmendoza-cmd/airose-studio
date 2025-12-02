import React from "react";
import { useSectionsEditor } from "@/lib/hooks/useSectionsEditor";

export function SectionsEditor({ slug }: { slug: string }) {
  const {
    title,
    setTitle,
    sections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    save,
    loading,
    saving,
  } = useSectionsEditor(slug);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="p-4 space-y-6">
      <div>
        <label className="block mb-1 text-sm font-semibold">Title</label>
        <input
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {sections.map((s, index) => (
          <div key={s.id} className="border p-3 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{s.type.toUpperCase()}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => reorderSections(index, index - 1)}
                  disabled={index === 0}
                >
                  ↑
                </button>

                <button
                  onClick={() => reorderSections(index, index + 1)}
                  disabled={index === sections.length - 1}
                >
                  ↓
                </button>

                <button onClick={() => deleteSection(s.id)}>Delete</button>
              </div>
            </div>

            {s.type === "text" && (
              <textarea
                className="border p-2 w-full h-32"
                value={s.content}
                onChange={(e) =>
                  updateSection(s.id, { content: e.target.value })
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => addSection("text")}
        >
          + Add Text Section
        </button>

        <button
          onClick={save}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Page"}
        </button>
      </div>
    </div>
  );
}
