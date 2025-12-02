// src/components/EditorControls.tsx
import React, { useState } from "react";
import { createEditorStore } from "../lib/editorStore";

type Props = { pagePath: string };

// NOTE: This component expects you to create a store per page outside or call createEditorStore here.
export function EditorControls({ pagePath }: Props) {
  const [status, setStatus] = useState<string>("idle");
  const store = React.useMemo(() => createEditorStore(pagePath), [pagePath]);

  React.useEffect(() => {
    store.init();
  }, [store]);

  async function onSaveLocal() {
    setStatus("saving...");
    const r = await store.saveLocally();
    if (r.ok) setStatus("saved locally");
    else setStatus("save failed: " + r.error);
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function onPublish() {
    // Publish must be executed manually by running scripts/publish.ts locally.
    // For convenience we POST to a local publish endpoint if you choose to add one.
    setStatus("publishing...");
    try {
      const resp = await fetch("/__local_publish/run", { method: "POST" });
      if (resp.ok) {
        const j = await resp.json();
        setStatus("published: " + (j.message || "ok"));
      } else {
        const text = await resp.text();
        setStatus("publish failed: " + text);
      }
    } catch (err: any) {
      setStatus("publish error: " + (err.message || String(err)));
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={onSaveLocal}>Save (local)</button>
      <button onClick={onPublish}>Publish (manual)</button>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{status}</span>
    </div>
  );
}
