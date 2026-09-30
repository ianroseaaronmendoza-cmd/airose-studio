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

## Source data restoration

The September 30 readings existed in raw!A2919:A2927 (morning) and
raw!A3088:A3093 (evening), but were absent from the serving tabs.
With the user-provided edit access, the two records were restored to
devotion_am!A356:E356 and devotion_pm!A357:E357. Readback exactly matched
the source-derived records. Both public feeds then returned 09-30 readings
with Psalm 66:2 and Ecclesiastes 9:4 respectively. No Apps Script change
or deployment was required. Other calendar gaps observed in the serving
tabs are outside this two-row restoration and still need a content audit.

## Calendar and leap-day verification

The full audit restored 21 additional readings, corrected 27 June morning date
labels, and separated June 2 text from June 1. Both calendars contain 366
unique dates; all 732 verse/date pairs match the CCEL public-domain edition
and all reading text matches the existing raw source.

February 29 DateKey cells (devotion_am!C358 and devotion_pm!C359) now store
a real February 29, 2000 date (Sheets serial 36585), displayed as MM-dd.
This preserves the visible 02-29 key while allowing the unchanged Apps Script
getValues/new Date lookup to use a real leap-year date rather than parsing
a yearless string in a non-leap year. Sheet and script timezones are both UTC+8.
No Apps Script redeployment or URL change is required.
