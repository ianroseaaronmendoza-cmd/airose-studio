// src/lib/localPersistence.ts
// Client-side persistence abstraction for dev-mode file writes.

type JsonValue = any;

const DEV_SERVER = (() => {
  try {
    const p = process.env.REACT_APP_SAVE_JSON_SERVER || "http://localhost:4545";
    return p;
  } catch {
    return "http://localhost:4545";
  }
})();

async function serverAvailable(): Promise<boolean> {
  try {
    const resp = await fetch(
      `${DEV_SERVER}/load?file=__test__/ping.json`,
      { method: "GET" }
    );
    return resp.status !== 404; // server exists even if file missing
  } catch {
    return false;
  }
}

export async function loadFile(path: string): Promise<JsonValue | null> {
  // Try dev server first
  try {
    const resp = await fetch(
      `${DEV_SERVER}/load?file=${encodeURIComponent(path)}`
    );
    if (resp.ok) {
      const j = await resp.json();
      return j.content;
    }
  } catch {
    // ignore
  }

  // fallback: localStorage
  const key = `persist:${path}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveFile(
  path: string,
  content: JsonValue
): Promise<{ ok: boolean; error?: string }> {
  // Try dev server first
  try {
    const resp = await fetch(`${DEV_SERVER}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: path, content }),
    });

    if (resp.ok) {
      return { ok: true };
    } else {
      const j = await resp.json().catch(() => null);
      return { ok: false, error: j?.error || `status ${resp.status}` };
    }
  } catch {
    // fallback to localStorage
    try {
      const key = `persist:${path}`;
      localStorage.setItem(key, JSON.stringify(content));
      return { ok: true };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown error";

      return { ok: false, error: message };
    }
  }
}
