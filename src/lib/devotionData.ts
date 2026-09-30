export interface DevotionData {
  displayDate: string;
  verse: { text: string; reference: string };
  text: string;
}

export class InvalidDevotionError extends Error {}

export function parseDevotion(data: unknown): DevotionData {
  const value = data as Partial<DevotionData> | null;
  const nonempty = (text: unknown): text is string =>
    typeof text === "string" && text.trim().length > 0;
  if (
    !value || typeof value !== "object" || "error" in value ||
    !nonempty(value.displayDate) || !nonempty(value.text) ||
    !nonempty(value.verse?.text) || !nonempty(value.verse?.reference)
  ) {
    throw new InvalidDevotionError("Devotion reading is unavailable or incomplete");
  }
  return value as DevotionData;
}
