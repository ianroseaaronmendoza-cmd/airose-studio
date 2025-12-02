import { Result, ok, fail } from "./result";

export async function httpPost<T>(
  url: string,
  body: any
): Promise<Result<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return fail(`HTTP ${res.status}: ${text}`);
    }

    const json = (await res.json()) as T;
    return ok(json);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";

    return fail(message);
  }
}

export async function httpGet<T>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      return fail(`HTTP ${res.status}: ${text}`);
    }

    const json = (await res.json()) as T;
    return ok(json);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";

    return fail(message);
  }
}
