# Devotion response validation

The September 30, 2026 public morning feed returned HTTP success with
`{"error":"Devotion not found for today","dateKey":"09-30","period":"am"}`.
The existing reader dereferenced `data.verse.text`, crashing the React tree.

The user authorized this narrow repair separately from the portfolio redesign.
The query now validates the payload before passing it to the reader and uses
the existing page error state for incomplete data. Invalid payloads are not
retried; transient network errors retain three retries. Valid readings remain
unchanged. No routes, page markup, styling, feed URL, or script are changed.
Only the hook's protected baseline hash is updated for this authorized change.

This prevents blank pages but does not create missing readings. The Apps Script
looks in the devotion_am and devotion_pm tabs of its source spreadsheet. Source
spreadsheet access is required to distinguish missing entries from date-format
lookup problems. Do not substitute a different day's reading or invent text.
