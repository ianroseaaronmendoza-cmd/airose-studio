import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import {
  createProject,
  updateProject,
  Project,
  PROJECT_STATUSES,
} from "../client/api/projects";
import { isDev } from "../lib/env";

const EMPTY: Partial<Project> = { title: "", description: "", content: "" };
type Props = {
  mode: "create" | "edit";
  slug?: string;
  initialData?: Partial<Project>;
};
type Row = Record<string, string>;
function Rows({
  label,
  fields,
  rows,
  onChange,
}: {
  label: string;
  fields: { key: string; label: string; type?: string }[];
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  return (
    <fieldset className="studio-field-wide">
      <legend>{label}</legend>
      {rows.map((row, index) => (
        <div key={index} className="studio-note" style={{ marginTop: 12 }}>
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.type === "textarea" ? (
                <textarea
                  value={row[field.key] || ""}
                  onChange={(e) =>
                    onChange(
                      rows.map((r, i) =>
                        i === index ? { ...r, [field.key]: e.target.value } : r,
                      ),
                    )
                  }
                />
              ) : (
                <input
                  type={field.type || "text"}
                  value={row[field.key] || ""}
                  onChange={(e) =>
                    onChange(
                      rows.map((r, i) =>
                        i === index ? { ...r, [field.key]: e.target.value } : r,
                      ),
                    )
                  }
                />
              )}
            </label>
          ))}
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            Remove {label.toLowerCase()} {index + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        style={{ marginTop: 12 }}
        onClick={() =>
          onChange([
            ...rows,
            Object.fromEntries(fields.map((f) => [f.key, ""])),
          ])
        }
      >
        Add {label.toLowerCase()} +
      </button>
    </fieldset>
  );
}
export default function ProjectsEditor({
  mode,
  slug,
  initialData = EMPTY,
}: Props) {
  const navigate = useNavigate(),
    editorRef = useRef<any>(null);
  const [draft, setDraft] = useState<Partial<Project>>(initialData),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setDraft(initialData);
  }, [initialData]);
  const set = (key: keyof Project, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));
  if (!isDev)
    return <p>Project editing is available in the local development site.</p>;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!draft.title?.trim() || !draft.description?.trim()) {
      setError("Title and description are required.");
      return;
    }
    const safeUrl = (url: string) =>
      /^https?:\/\//.test(url) || /^\/(?!\/)/.test(url);
    if (draft.cover && !safeUrl(draft.cover)) {
      setError("Use a website URL or a path beginning with / for the cover.");
      return;
    }
    if (
      draft.links?.some((l) => !l.label.trim() || !safeUrl(l.url)) ||
      draft.screenshots?.some((s) => !s.alt.trim() || !safeUrl(s.url))
    ) {
      setError("Each link or screenshot needs a description and a valid URL.");
      return;
    }
    if (
      draft.updates?.some((u) => !u.date || !u.title.trim() || !u.body.trim())
    ) {
      setError(
        "Complete the date, title, and text for each development update.",
      );
      return;
    }
    setSaving(true);
    try {
      const now = Date.now();
      const payload: Project = {
        ...draft,
        slug:
          slug ||
          draft.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        title: draft.title.trim(),
        description: draft.description.trim(),
        content: editorRef.current?.getContent() ?? draft.content ?? "",
        createdAt: draft.createdAt || now,
        updatedAt: now,
      } as Project;
      if (mode === "edit") await updateProject(payload);
      else await createProject(payload);
      navigate("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="studio-container"
      style={{ paddingBottom: 60 }}
    >
      <h1>{mode === "edit" ? "Edit project" : "New project"}</h1>
      <div className="studio-editor-fields">
        <label>
          Title
          <input
            value={draft.title || ""}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </label>
        <label>
          Category
          <input
            placeholder="Game, software, tool…"
            value={draft.category || ""}
            onChange={(e) => set("category", e.target.value)}
          />
        </label>
        <label className="studio-field-wide">
          Short description
          <textarea
            value={draft.description || ""}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </label>
        <label>
          Status
          <select
            value={draft.status || ""}
            onChange={(e) => set("status", e.target.value || undefined)}
          >
            <option value="">Not specified</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Cover image URL
          <input
            value={draft.cover || ""}
            onChange={(e) => set("cover", e.target.value)}
          />
        </label>
        <label className="studio-field-wide">
          <input
            type="checkbox"
            style={{ display: "inline", width: "auto", marginRight: 10 }}
            checked={!!draft.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Feature on the home page
        </label>
        <Rows
          label="Links"
          fields={[
            { key: "label", label: "Link label" },
            { key: "url", label: "Website URL" },
          ]}
          rows={(draft.links || []) as Row[]}
          onChange={(rows) => set("links", rows)}
        />
        <Rows
          label="Screenshots"
          fields={[
            { key: "url", label: "Image URL" },
            { key: "alt", label: "Image description" },
          ]}
          rows={(draft.screenshots || []) as Row[]}
          onChange={(rows) => set("screenshots", rows)}
        />
        <Rows
          label="Development updates"
          fields={[
            { key: "date", label: "Date", type: "date" },
            { key: "title", label: "Title" },
            { key: "body", label: "Update", type: "textarea" },
          ]}
          rows={(draft.updates || []) as Row[]}
          onChange={(rows) => set("updates", rows)}
        />
      </div>
      <h2 style={{ marginTop: 32 }}>Project story</h2>
      <TinyMCEEditor
        apiKey="g7hb7redt7cl6evm9wavtpy2f0mpfxvch87druxrrru3j2a5"
        initialValue={initialData.content || ""}
        onInit={(_, editor) => {
          editorRef.current = editor;
        }}
        init={{
          height: 400,
          menubar: true,
          plugins: "link lists image code table",
          toolbar:
            "undo redo | blocks | bold italic | bullist numlist | link image | code",
          skin: "oxide-dark",
          content_css: "dark",
        }}
      />
      {error && (
        <p role="alert" style={{ color: "#ffb8c2", marginTop: 20 }}>
          {error}
        </p>
      )}
      <div className="studio-actions">
        <button className="studio-button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save project"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Discard unsaved changes?")) navigate("/projects");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
