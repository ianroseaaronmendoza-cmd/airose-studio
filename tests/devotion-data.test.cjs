const { test } = require("node:test");
const assert = require("node:assert/strict");
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "CommonJS" } });
const { parseDevotion, InvalidDevotionError } = require("../src/lib/devotionData.ts");

const reading = { displayDate: "September 30", verse: { text: "Example verse", reference: "Example reference" }, text: "Example reading" };

test("complete devotion data reaches the reader unchanged", () => {
  assert.equal(parseDevotion(reading), reading);
});

test("HTTP-success missing-reading responses become query errors", () => {
  for (const period of ["am", "pm"]) {
    assert.throws(() => parseDevotion({ error: "Devotion not found for today", dateKey: "09-30", period }), InvalidDevotionError);
  }
});

test("malformed readings cannot reach the reader", () => {
  for (const data of [null, undefined, [], {}, "error", { ...reading, verse: undefined }, { ...reading, verse: null }, { ...reading, verse: { text: "ok" } }, { ...reading, text: " " }, { ...reading, displayDate: 30 }, { ...reading, error: "Unavailable" }]) {
    assert.throws(() => parseDevotion(data), InvalidDevotionError);
  }
});
